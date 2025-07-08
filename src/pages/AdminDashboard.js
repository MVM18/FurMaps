import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { supabase } from '../lib/supabaseClient';

const providers = [];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  
  // Additional state for button functionality
  const [showNotification, setShowNotification] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [viewedDocument, setViewedDocument] = useState(null);
  const [userFilterOpen, setUserFilterOpen] = useState(false);
  const [viewedUser, setViewedUser] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('Last 30 days');
  const [showExportMsg, setShowExportMsg] = useState(false);
  const [providersList, setProvidersList] = useState(providers);
  const [usersList, setUsersList] = useState([]);
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [showAnalyticsDropdown, setShowAnalyticsDropdown] = useState(false);
  const [providerFilterOpen, setProviderFilterOpen] = useState(false);
  const [providerStatusFilter, setProviderStatusFilter] = useState('Pending');
  const [providerSort, setProviderSort] = useState('A-Z');
  const [providerSortOpen, setProviderSortOpen] = useState(false);
  const [userSort, setUserSort] = useState('A-Z');
  const [userSortOpen, setUserSortOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Chart tooltip state
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', color: 'green', icon: 'total-users.svg' },
    { label: 'Active Providers', value: '0', color: 'blue', icon: 'active-providers.svg' },
    { label: 'Pending Approval', value: '0', color: 'yellow', icon: 'pending_approval.svg' },
    { label: 'Suspended', value: '0', color: 'red', icon: 'suspended_acc.svg' },
  ]);

  // Analytics state
  const [analyticsStats, setAnalyticsStats] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    bookings: [],
    revenue: [],
    serviceDistribution: [],
    platformGrowth: []
  });

  // Add state for provider reports
  const [providerReports, setProviderReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Add state for viewing a report
  const [viewedReport, setViewedReport] = useState(null);

  
  // Add state for report sub-tab
  const [reportSubTab, setReportSubTab] = useState('provider');

  // Add state for pet owner reports
  const [petOwnerReports, setPetOwnerReports] = useState([]);
  const [isLoadingPetOwnerReports, setIsLoadingPetOwnerReports] = useState(true);

  // Add state for viewing a pet owner report
  const [viewedPetOwnerReport, setViewedPetOwnerReport] = useState(null);

  // Fetch profiles from Supabase on mount
  const fetchProfiles = async () => {
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Fetch booking counts for all users (only completed bookings)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('pet_owner_id, service_provider_id')
        .eq('status', 'completed');

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return;
      }

      // Create a map of user_id to booking count
      const bookingCounts = {};
      
      // Count bookings for pet owners (as customers)
      bookingsData.forEach(booking => {
        if (booking.pet_owner_id) {
          bookingCounts[booking.pet_owner_id] = (bookingCounts[booking.pet_owner_id] || 0) + 1;
        }
      });

      // Count bookings for service providers (as providers)
      bookingsData.forEach(booking => {
        if (booking.service_provider_id) {
          bookingCounts[booking.service_provider_id] = (bookingCounts[booking.service_provider_id] || 0) + 1;
        }
      });

      console.log('Completed booking counts:', bookingCounts);

      // Map data to expected format
      const mappedUsers = profilesData.map(profile => {
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        const name = `${firstName} ${lastName}`.trim() || 'Unknown User';
        
        return {
          user_id: profile.user_id,
          name: name,
          email: profile.email || profile.user_id || 'No email',
          role: profile.role || 'owner',
          status: profile.status || 'Active',
          joined: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '',
          bookings: bookingCounts[profile.user_id] || 0,
          initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U',
          services: profile.services_offered || '',
          location: profile.address || '',
          submitted: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '',
          documents: [
            ...(profile.certificate ? [{ 
              type: 'Certificate', 
              filename: profile.certificate.split('/').pop() || 'certificate.pdf', 
              url: profile.certificate,
              color: 'blue', 
              icon: 'certificate.svg' 
            }] : []),
            ...(profile.valid_id ? [{ 
              type: 'Valid ID', 
              filename: profile.valid_id.split('/').pop() || 'valid-id.pdf', 
              url: profile.valid_id,
              color: 'green', 
              icon: 'id-card.svg' 
            }] : []),
            ...(profile.proof_of_address ? [{ 
              type: 'Proof of Address', 
              filename: profile.proof_of_address.split('/').pop() || 'proof-of-address.pdf', 
              url: profile.proof_of_address,
              color: 'yellow', 
              icon: 'address.svg' 
            }] : []),
          ],
        };
      });

      console.log('Fetched profiles:', profilesData);
      console.log('Mapped users with booking counts:', mappedUsers);
      
      setUsersList(mappedUsers.filter(profile => profile.role === 'owner' || profile.role === 'provider'));
      setProvidersList(mappedUsers.filter(profile => profile.role === 'provider'));
      recalculateStats(mappedUsers);
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
    }
  };

  useEffect(() => {
    fetchProfiles();
    const { profilesSubscription, reportsSubscription } = setupRealtimeSubscriptions();
    handleNotificationPermission();
    
    // Cleanup subscription on unmount
    return () => {
      if (profilesSubscription) {
        supabase.removeChannel(profilesSubscription);
      }
      if (reportsSubscription) {
        supabase.removeChannel(reportsSubscription);
      }
    };
  }, []);

  // Setup real-time subscriptions for notifications
  const setupRealtimeSubscriptions = () => {
    // Subscribe to new provider registrations
    const profilesSubscription = supabase
      .channel('profiles_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'profiles',
          filter: 'role=eq.provider'
        }, 
        (payload) => {
          console.log('New provider registered:', payload.new);
          handleNewProviderNotification(payload.new);
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.provider'
        },
        (payload) => {
          console.log('Provider status updated:', payload.new);
          handleProviderStatusChange(payload.old, payload.new);
        }
      )
      .subscribe();

    // In setupRealtimeSubscriptions, add subscriptions for new provider and pet owner reports
    const reportsSubscription = supabase
      .channel('reports_changes')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'provider_reports'
        },
        async (payload) => {
          await handleNewReportNotification('provider', payload.new);
        }
      )
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pet_owner_reports'
        },
        async (payload) => {
          await handleNewReportNotification('owner', payload.new);
        }
      )
      .subscribe();

    return { profilesSubscription, reportsSubscription };
  };

  // Handle new provider notification
  const handleNewProviderNotification = (newProvider) => {
    const firstName = newProvider.first_name || '';
    const lastName = newProvider.last_name || '';
    const providerName = `${firstName} ${lastName}`.trim() || 'Unknown Provider';
    
    const newNotification = {
      id: Date.now(),
      type: 'new_provider',
      title: 'New Provider Registration',
      message: `${providerName} has registered as a service provider and is pending approval.`,
      timestamp: new Date().toISOString(),
      read: false,
      providerId: newProvider.user_id
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Provider Registration', {
        body: `${providerName} has registered and is pending approval.`,
        icon: '/Images/paw-logo.png'
      });
    }
  };

  // Handle provider status change notification
  const handleProviderStatusChange = (oldProvider, newProvider) => {
    const firstName = newProvider.first_name || '';
    const lastName = newProvider.last_name || '';
    const providerName = `${firstName} ${lastName}`.trim() || 'Unknown Provider';
    
    let notificationTitle = '';
    let notificationMessage = '';
    
    if (oldProvider.status === 'Pending' && newProvider.status === 'Approved') {
      notificationTitle = 'Provider Approved';
      notificationMessage = `${providerName} has been approved and is now active.`;
    } else if (oldProvider.status === 'Pending' && newProvider.status === 'Rejected') {
      notificationTitle = 'Provider Rejected';
      notificationMessage = `${providerName} has been rejected.`;
    } else if (newProvider.status === 'Suspended') {
      notificationTitle = 'Provider Suspended';
      notificationMessage = `${providerName} has been suspended.`;
    } else if (oldProvider.status === 'Suspended' && newProvider.status === 'Active') {
      notificationTitle = 'Provider Reactivated';
      notificationMessage = `${providerName} has been reactivated.`;
    }

    if (notificationTitle) {
      const newNotification = {
        id: Date.now(),
        type: 'status_change',
        title: notificationTitle,
        message: notificationMessage,
        timestamp: new Date().toISOString(),
        read: false,
        providerId: newProvider.user_id
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notificationTitle, {
          body: notificationMessage,
          icon: '/Images/paw-logo.png'
        });
      }
    }
  };

  // Fetch analytics data when period changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [analyticsPeriod]);

  // Function to fetch analytics data from database
  const fetchAnalyticsData = async () => {
    setIsLoadingAnalytics(true);
    try {
      const periodDays = analyticsPeriod === 'Last 7 days' ? 7 : 
                        analyticsPeriod === 'Last 30 days' ? 30 : 90;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // Fetch bookings data (only completed bookings)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          total_price,
          status,
          created_at,
          service_provider_id,
          services (
            name,
            service_type
          )
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return;
      }

      // Fetch reviews data for ratings
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          service_provider_id,
          created_at
        `)
        .gte('created_at', startDate.toISOString());

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        return;
      }

      // Fetch provider profiles for names
      const { data: providersData, error: providersError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name,
          role,
          status
        `)
        .eq('role', 'provider');

      if (providersError) {
        console.error('Error fetching providers:', providersError);
        return;
      }

      // Calculate analytics stats (all bookings are now completed)
      const totalBookings = bookingsData.length;
      const totalRevenue = bookingsData.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      
      const previousPeriodDays = periodDays * 2;
      const previousStartDate = new Date();
      previousStartDate.setDate(previousStartDate.getDate() - previousPeriodDays);
      const previousEndDate = new Date();
      previousEndDate.setDate(previousEndDate.getDate() - periodDays);

      // Fetch previous period data for comparison (only completed bookings)
      const { data: previousBookingsData } = await supabase
        .from('bookings')
        .select('total_price, status')
        .eq('status', 'completed')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', previousEndDate.toISOString());

      const previousTotalBookings = previousBookingsData?.length || 0;
      const previousRevenue = previousBookingsData?.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0) || 0;

      // Calculate percentage changes
      const bookingChange = previousTotalBookings > 0 
        ? ((totalBookings - previousTotalBookings) / previousTotalBookings) * 100 
        : totalBookings > 0 ? 100 : 0;
      
      const revenueChange = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : totalRevenue > 0 ? 100 : 0;

      // Set analytics stats (all bookings are completed)
      setAnalyticsStats([
        { 
          label: 'Completed Bookings', 
          value: totalBookings.toString(), 
          change: `${bookingChange >= 0 ? '+' : ''}${bookingChange.toFixed(1)}%`, 
          desc: 'vs previous period', 
          icon: 'bookings.svg' 
        },
        { 
          label: 'Revenue', 
          value: `₱${totalRevenue.toLocaleString()}`, 
          change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`, 
          desc: 'vs previous period', 
          icon: 'pesos.svg' 
        },
        { 
          label: 'Average Revenue', 
          value: totalBookings > 0 ? `₱${(totalRevenue / totalBookings).toFixed(0)}` : '₱0', 
          change: `${reviewsData.length}`, 
          desc: 'per booking', 
          icon: 'done.svg' 
        },
        { 
          label: 'Active Providers', 
          value: providersData.filter(p => p.role === 'provider' && (p.status === 'Active' || p.status === 'Approved')).length.toString(), 
          change: `${reviewsData.length}`, 
          desc: 'total reviews', 
          icon: 'star.svg' 
        }
      ]);

      // Debug analytics provider count
      const activeProvidersAnalytics = providersData.filter(p => p.role === 'provider' && (p.status === 'Active' || p.status === 'Approved')).length;
      console.log('Analytics Active Providers:', {
        totalProviders: providersData.filter(p => p.role === 'provider').length,
        activeProviders: activeProvidersAnalytics,
        providerStatuses: [...new Set(providersData.map(p => p.status))]
      });

      // Calculate top performing providers
      const providerStats = {};
      
      // Initialize provider stats (only for active/approved providers)
      providersData.forEach(provider => {
        if (provider.role === 'provider' && (provider.status === 'Active' || provider.status === 'Approved')) {
          providerStats[provider.user_id] = {
            name: `${provider.first_name} ${provider.last_name}`.trim(),
            bookings: 0,
            revenue: 0,
            ratings: []
          };
        }
      });

      // Calculate provider stats from bookings (all are completed)
      bookingsData.forEach(booking => {
        if (booking.service_provider_id && providerStats[booking.service_provider_id]) {
          providerStats[booking.service_provider_id].bookings++;
          providerStats[booking.service_provider_id].revenue += parseFloat(booking.total_price) || 0;
        }
      });

      // Calculate provider stats from reviews
      reviewsData.forEach(review => {
        if (review.service_provider_id && providerStats[review.service_provider_id]) {
          providerStats[review.service_provider_id].ratings.push(review.rating);
        }
      });

      // Convert to array and calculate averages
      const topProvidersList = Object.entries(providerStats)
        .map(([userId, stats]) => ({
          name: stats.name,
          bookings: stats.bookings,
          revenue: stats.revenue,
          rating: stats.ratings.length > 0 
            ? (stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length).toFixed(1)
            : '0.0'
        }))
        .filter(provider => provider.bookings > 0 || provider.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopProviders(topProvidersList);

      // Calculate service distribution
      const serviceTypes = {};
      bookingsData.forEach(booking => {
        const serviceType = booking.services?.service_type || 'Unknown';
        serviceTypes[serviceType] = (serviceTypes[serviceType] || 0) + 1;
      });

      const serviceDistribution = Object.entries(serviceTypes)
        .map(([type, count]) => ({
          type,
          count,
          percentage: (count / totalBookings) * 100
        }))
        .sort((a, b) => b.count - a.count);

      setAnalyticsData({
        bookings: bookingsData,
        revenue: bookingsData.filter(b => b.status === 'completed'),
        serviceDistribution,
        platformGrowth: generatePlatformGrowthData(bookingsData, periodDays)
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Generate platform growth data for charts
  const generatePlatformGrowthData = (bookingsData, periodDays) => {
    const growthData = [];
    const now = new Date();
    
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayBookings = bookingsData.filter(booking => 
        booking.created_at.startsWith(dateStr)
      );
      
      const dayRevenue = dayBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      
      growthData.push({
        date: dateStr,
        bookings: dayBookings.length,
        revenue: dayRevenue
      });
    }
    
    return growthData;
  };

  function recalculateStats(users) {
    const totalUsers = users.length;
    // Check for both 'Active' and 'Approved' status for active providers
    const activeProviders = users.filter(u => u.role === 'provider' && (u.status === 'Active' || u.status === 'Approved')).length;
    const pendingApproval = users.filter(u => u.role === 'provider' && u.status === 'Pending').length;
    const suspended = users.filter(u => u.status === 'Suspended').length;

    console.log('Stats calculation:', {
      totalUsers,
      activeProviders,
      pendingApproval,
      suspended,
      statuses: [...new Set(users.map(u => u.status))]
    });

    setStats([
      { label: 'Total Users', value: totalUsers.toString(), color: 'green', icon: 'total-users.svg' },
      { label: 'Active Providers', value: activeProviders.toString(), color: 'blue', icon: 'active-providers.svg' },
      { label: 'Pending Approval', value: pendingApproval.toString(), color: 'yellow', icon: 'pending_approval.svg' },
      { label: 'Suspended', value: suspended.toString(), color: 'red', icon: 'suspended_acc.svg' },
    ]);
  }

  // Handler functions
  const handleBellClick = () => {
    setShowNotificationPanel(!showNotificationPanel);
    // Mark all notifications as read when opening panel
    if (!showNotificationPanel) {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    }
  };

  const handleNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      }
    }
  };

  // Tooltip handlers
  const showTooltip = (content, x, y) => {
    setTooltip({ show: true, content, x, y });
  };

  const hideTooltip = () => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);


    alert('Successfully logged out!');
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleViewDocument = (provider, doc) => {
    if (doc.url) {
      // Open document in new tab
      window.open(doc.url, '_blank');
    } else {
      setViewedDocument({ provider, doc });
      console.log(`Viewing document: ${doc.filename} for ${provider.name}`);
    }
  };

  const handleCloseDocument = () => {
    setViewedDocument(null);
  };

  const handleApproveProvider = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'Approved' })
      .eq('user_id', userId);

    if (error) {
      alert('Failed to approve provider: ' + error.message);
      console.error(error);
    } else {
      fetchProfiles();
      alert(`Provider ${userId} has been approved!`);
    }
  };

  const handleRejectProvider = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'Rejected' })
      .eq('user_id', userId);

    if (error) {
      alert('Failed to reject provider: ' + error.message);
      console.error(error);
    } else {
      fetchProfiles();
      alert(`Provider ${userId} has been rejected!`);
    }
  };

  const handleUserFilterClick = () => {
    setUserFilterOpen(!userFilterOpen);
  };

  const handleViewUser = (user) => {
    setViewedUser(user);
  };

  const handleCloseUser = () => setViewedUser(null);

  const handleSuspendUser = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'Suspended' })
      .eq('user_id', userId);

    console.log('Suspend response:', { data, error });

    if (error) {
      alert('Failed to suspend user: ' + error.message);
      console.error(error);
    } else {
      await fetchProfiles(); // Await here!
      alert(`User ${userId} has been suspended!`);
    }
  };

  const handleActivateUser = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'Active' })
      .eq('user_id', userId);

    if (error) {
      alert('Failed to activate user: ' + error.message);
      console.error(error);
    } else {
      await fetchProfiles(); // Await here!
      alert(`User ${userId} has been activated!`);
    }
  };

  const handleAnalyticsPeriodChange = (period) => {
    setAnalyticsPeriod(period);
    console.log(`Analytics period changed to: ${period}`);
  };

  const handleExport = () => {
    setShowExportMsg(true);
    setTimeout(() => setShowExportMsg(false), 2000);
    
    // Create CSV data for export
    const csvData = [
      // Headers
      ['Metric', 'Value', 'Change', 'Description'],
      // Analytics stats
      ...analyticsStats.map(stat => [
        stat.label,
        stat.value,
        stat.change,
        stat.desc
      ]),
      // Empty row
      [],
      // Top providers
      ['Top Performing Providers'],
      ['Name', 'Bookings', 'Rating', 'Revenue'],
      ...topProviders.map(prov => [
        prov.name,
        prov.bookings.toString(),
        prov.rating,
        `₱${prov.revenue.toLocaleString()}`
      ]),
      // Empty row
      [],
      // Service distribution
      ['Service Distribution'],
      ['Service Type', 'Count', 'Percentage'],
      ...analyticsData.serviceDistribution.map(service => [
        service.type,
        service.count.toString(),
        `${service.percentage.toFixed(1)}%`
      ])
    ];
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `furmaps-analytics-${analyticsPeriod.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Analytics data exported successfully');
  };

  const filteredUsers = sortList(
    usersList.filter(
      (u) =>
        (userTypeFilter === 'All' || u.role === userTypeFilter) &&
        ((u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
         (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())))
    ),
    userSort
  );

  const filteredProviders = sortList(
    providersList.filter(provider => {
      const matchesSearch = (provider.name && provider.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (provider.email && provider.email.toLowerCase().includes(searchTerm.toLowerCase()));
      if (providerStatusFilter === 'All' || providerStatusFilter === 'Pending') {
        return provider.status === 'Pending' && matchesSearch;
      } else {
        return provider.status === providerStatusFilter && matchesSearch;
      }
    }),
    providerSort
  );

  // Fetch provider reports when Reports tab is active
  useEffect(() => {
    if (activeTab === 2) {
      fetchProviderReports();
    }
  }, [activeTab]);

  const fetchProviderReports = async () => {
    setIsLoadingReports(true);
    try {
      // Step 1: Fetch all reports (no joins)
      const { data: reports, error } = await supabase
        .from('provider_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !reports) {
        setProviderReports([]);
        setIsLoadingReports(false);
        return;
      }
      // Step 2: Collect all unique provider and reporter IDs
      const providerIds = [...new Set(reports.map(r => r.provider_id).filter(Boolean))];
      const reporterIds = [...new Set(reports.map(r => r.reporter_id).filter(Boolean))];
      const allProfileIds = Array.from(new Set([...providerIds, ...reporterIds]));
      // Step 3: Fetch all relevant profiles
      let profiles = [];
      if (allProfileIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', allProfileIds);
        if (!profilesError && profilesData) {
          profiles = profilesData;
        }
      }
      // Step 4: Merge profile info into reports
      const profileMap = {};
      profiles.forEach(p => { profileMap[p.user_id] = p; });
      const mergedReports = reports.map(report => ({
        ...report,
        provider: profileMap[report.provider_id] || null,
        reporter: profileMap[report.reporter_id] || null,
      }));
      setProviderReports(mergedReports);
    } catch (err) {
      setProviderReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Fetch pet owner reports when Reports tab is active and sub-tab is 'owner'
  useEffect(() => {
    if (activeTab === 2 && reportSubTab === 'owner') {
      fetchPetOwnerReports();
    }
  }, [activeTab, reportSubTab]);

  const fetchPetOwnerReports = async () => {
    setIsLoadingPetOwnerReports(true);
    try {
      // Step 1: Fetch all reports (no joins)
      const { data: reports, error } = await supabase
        .from('pet_owner_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !reports) {
        setPetOwnerReports([]);
        setIsLoadingPetOwnerReports(false);
        return;
      }
      // Step 2: Collect all unique pet owner and reporter IDs
      const petOwnerIds = [...new Set(reports.map(r => r.pet_owner_id).filter(Boolean))];
      const reporterIds = [...new Set(reports.map(r => r.reporter_id).filter(Boolean))];
      const allProfileIds = Array.from(new Set([...petOwnerIds, ...reporterIds]));
      // Step 3: Fetch all relevant profiles
      let profiles = [];
      if (allProfileIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', allProfileIds);
        if (!profilesError && profilesData) {
          profiles = profilesData;
        }
      }
      // Step 4: Merge profile info into reports
      const profileMap = {};
      profiles.forEach(p => { profileMap[p.user_id] = p; });
      const mergedReports = reports.map(report => ({
        ...report,
        pet_owner: profileMap[report.pet_owner_id] || null,
        reporter: profileMap[report.reporter_id] || null,
      }));
      setPetOwnerReports(mergedReports);
    } catch (err) {
      setPetOwnerReports([]);
    } finally {
      setIsLoadingPetOwnerReports(false);
    }
  };

  // Move handleNewReportNotification inside the AdminDashboard component
  const handleNewReportNotification = async (type, report) => {
    let title = '';
    let message = '';
    let reportedName = '';

    // Fetch the reported user's profile from the database
    let reportedId = type === 'provider' ? report.provider_id : report.pet_owner_id;
    if (reportedId) {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', reportedId)
        .single();
      if (!error && profiles) {
        reportedName = `${profiles.first_name || ''} ${profiles.last_name || ''}`.trim();
      }
    }

    if (type === 'provider') {
      title = 'New Provider Report';
      message = `A new report has been submitted against provider${reportedName ? ' ' + reportedName : ''}. Please review it.`;
    } else if (type === 'owner') {
      title = 'New Pet Owner Report';
      message = `A new report has been submitted against pet owner${reportedName ? ' ' + reportedName : ''}. Please review it.`;
    }
    const newNotification = {
      id: Date.now(),
      type: type === 'provider' ? 'new_provider_report' : 'new_pet_owner_report',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      reportId: report.id
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/Images/paw-logo.png'
      });
    }
  };

  return (
    <div className="dashboard-bg">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="logo">
             <img className="logo-icon" src="Images/gps.png" alt="Logo" />
            <span className="furmapsAdminLogoText">
              FurMaps
            </span>
          </div>
          <div className="header-actions">
            <button className="bell-btn" onClick={handleBellClick}>
              <img src="/Images/notification.svg" alt="Notifications" />
              {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </button>
            <button className="logout-btn" onClick={handleLogoutClick}>
              <img src="/Images/log-out.svg" alt="Logout" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotificationPanel && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button 
              className="notification-close-btn"
              onClick={() => setShowNotificationPanel(false)}
            >
              ×
            </button>
          </div>
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    {notification.type === 'new_provider' ? '👤' : '📋'}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="admin-dashboard-main">
        {/* Title */}
        <div className="admin-dashboard-title-section">
          <div className="admin-dashboard-title">Admin Dashboard</div>
          <div className="admin-dashboard-desc">Manage users and approve service providers</div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.color}`}>
              <div className="stat-label">
                <img src={`/Images/${stat.icon}`} alt="icon" />
                {stat.label}
              </div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              className={`tab${activeTab === i ? ' active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pending Approvals Card */}
        {activeTab === 0 && (
          <div className="card">
            <div className="card-title">Service Provider Approvals</div>
            <div className="card-desc">Review and approve new service provider applications</div>
            <div className="search-filter-bar">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-bar-input"
              />
              <div className="filter-controls">
                <div className="user-filter-box">
                  <button className="user-filter-btn" onClick={() => setProviderFilterOpen(open => !open)}>
                    {providerStatusFilter === 'All' ? 'Filter by type' : providerStatusFilter}
                    <img src="/Images/filter.svg" alt="dropdown" />
                  </button>
                  {providerFilterOpen && (
                    <div className="user-filter-dropdown">
                      <div key="filter-all" className={`user-filter-dropdown-item ${providerStatusFilter === 'All' ? 'active' : ''}`}
                        onClick={() => { setProviderStatusFilter('All'); setProviderFilterOpen(false); }}>All</div>
                      <div key="filter-pending" className={`user-filter-dropdown-item ${providerStatusFilter === 'Pending' ? 'active' : ''}`}
                        onClick={() => { setProviderStatusFilter('Pending'); setProviderFilterOpen(false); }}>Pending</div>
                      <div key="filter-approved" className={`user-filter-dropdown-item ${providerStatusFilter === 'Approved' ? 'active' : ''}`}
                        onClick={() => { setProviderStatusFilter('Approved'); setProviderFilterOpen(false); }}>Approved</div>
                      <div key="filter-rejected" className={`user-filter-dropdown-item ${providerStatusFilter === 'Rejected' ? 'active' : ''}`}
                        onClick={() => { setProviderStatusFilter('Rejected'); setProviderFilterOpen(false); }}>Rejected</div>
                    </div>
                  )}
                </div>
                <div className="user-filter-box">
                  <button className="user-filter-btn" onClick={() => setProviderSortOpen(open => !open)}>
                    {providerSort === 'A-Z' ? 'Sort: Name (A-Z)' :
                      providerSort === 'Z-A' ? 'Sort: Name (Z-A)' :
                      providerSort === 'Oldest' ? 'Sort: Oldest Joined' :
                      'Sort: Latest Joined'}
                    <img src="/Images/filter.svg" alt="dropdown" />
                  </button>
                  {providerSortOpen && (
                    <div className="user-filter-dropdown">
                      <div key="sort-a-z" className={`user-filter-dropdown-item ${providerSort === 'A-Z' ? 'active' : ''}`}
                        onClick={() => { setProviderSort('A-Z'); setProviderSortOpen(false); }}>Name (A-Z)</div>
                      <div key="sort-z-a" className={`user-filter-dropdown-item ${providerSort === 'Z-A' ? 'active' : ''}`}
                        onClick={() => { setProviderSort('Z-A'); setProviderSortOpen(false); }}>Name (Z-A)</div>
                      <div key="sort-oldest" className={`user-filter-dropdown-item ${providerSort === 'Oldest' ? 'active' : ''}`}
                        onClick={() => { setProviderSort('Oldest'); setProviderSortOpen(false); }}>Oldest Joined</div>
                      <div key="sort-latest" className={`user-filter-dropdown-item ${providerSort === 'Latest' ? 'active' : ''}`}
                        onClick={() => { setProviderSort('Latest'); setProviderSortOpen(false); }}>Latest Joined</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {filteredProviders.map((provider) => {
              const missingDocs = getMissingDocuments(provider);
              const allDocsUploaded = missingDocs.length === 0;
              return (
                <div className="provider-approval" key={provider.user_id}>
                  <div className="provider-header">
                    <div className="provider-avatar">{provider.initials}</div>
                    <div className="provider-details">
                      <div className="provider-name">{provider.name}</div>
                      <div className="provider-email">{provider.email}</div>
                      <div className="provider-meta">Services: {provider.services}</div>
                      <div className="provider-meta">Location: {provider.location}</div>
                      <div className="provider-meta">Submitted: {provider.submitted}</div>
                    </div>
                  </div>
                  {/* Document completeness badge */}
                 
                  <div className="submitted-documents-title">Submitted Documents:</div>
                  <div className="documents-row">
                    {provider.documents.map((doc) => (
                      <div className={`document-card ${doc.color}`} key={`${provider.user_id}-${doc.type}`}>
                        <div className="document-header">
                         
                          <div className={`document-title${doc.color !== 'blue' ? ' ' + doc.color : ''}`}>{doc.type}</div>
                        </div>
                        <div className="document-filename">{doc.filename}</div>
                        <button className={`document-btn${doc.color !== 'blue' ? ' ' + doc.color : ''}`} onClick={() => handleViewDocument(provider, doc)}>View</button>
                      </div>
                    ))}
                  </div>
                  <div className="action-row">
                    <button className="approve-btn" onClick={() => handleApproveProvider(provider.user_id)} disabled={!allDocsUploaded}>Approve</button>
                    <button className="reject-btn" onClick={() => handleRejectProvider(provider.user_id)}>Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 1 && (
          <div className="card">
            <div className="card-title">User Management</div>
            <div className="card-desc">Manage all platform users</div>
            <div className="search-filter-bar">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-bar-input"
              />
              <div className="filter-controls">
                <div className="user-filter-box">
                  <button className="user-filter-btn" onClick={handleUserFilterClick}>
                    {userTypeFilter === 'All' ? 'Filter by type' : userTypeFilter}
                    <img src="/Images/filter.svg" alt="dropdown" />
                  </button>
                  {userFilterOpen && (
                    <div className="user-filter-dropdown">
                      <div key="user-filter-all" className={`user-filter-dropdown-item ${userTypeFilter === 'All' ? 'active' : ''}`}
                        onClick={() => { setUserTypeFilter('All'); setUserFilterOpen(false); }}>All</div>
                      <div key="user-filter-owner" className={`user-filter-dropdown-item ${userTypeFilter === 'owner' ? 'active' : ''}`}
                        onClick={() => { setUserTypeFilter('owner'); setUserFilterOpen(false); }}>Pet Owner</div>
                      <div key="user-filter-provider" className={`user-filter-dropdown-item ${userTypeFilter === 'provider' ? 'active' : ''}`}
                        onClick={() => { setUserTypeFilter('provider'); setUserFilterOpen(false); }}>Service Provider</div>
                    </div>
                  )}
                </div>
                <div className="user-filter-box">
                  <button className="user-filter-btn" onClick={() => setUserSortOpen(open => !open)}>
                    {userSort === 'A-Z' ? 'Sort: Name (A-Z)' :
                      userSort === 'Z-A' ? 'Sort: Name (Z-A)' :
                      userSort === 'Oldest' ? 'Sort: Oldest Joined' :
                      'Sort: Latest Joined'}
                    <img src="/Images/filter.svg" alt="dropdown" />
                  </button>
                  {userSortOpen && (
                    <div className="user-filter-dropdown">
                      <div key="user-sort-a-z" className={`user-filter-dropdown-item ${userSort === 'A-Z' ? 'active' : ''}`}
                        onClick={() => { setUserSort('A-Z'); setUserSortOpen(false); }}>Name (A-Z)</div>
                      <div key="user-sort-z-a" className={`user-filter-dropdown-item ${userSort === 'Z-A' ? 'active' : ''}`}
                        onClick={() => { setUserSort('Z-A'); setUserSortOpen(false); }}>Name (Z-A)</div>
                      <div key="user-sort-oldest" className={`user-filter-dropdown-item ${userSort === 'Oldest' ? 'active' : ''}`}
                        onClick={() => { setUserSort('Oldest'); setUserSortOpen(false); }}>Oldest Joined</div>
                      <div key="user-sort-latest" className={`user-filter-dropdown-item ${userSort === 'Latest' ? 'active' : ''}`}
                        onClick={() => { setUserSort('Latest'); setUserSortOpen(false); }}>Latest Joined</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="user-list">
              {filteredUsers.map(user => (
                <div className="user-row" key={user.user_id}>
                  <div className="user-avatar">{user.initials}</div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-joined">Joined: {user.joined}</div>
                  </div>
                  <div className="user-role">
                    {user.role}
                    <div className="user-bookings">{user.bookings} bookings</div>
                  </div>
                  <div className="user-status-actions">
                    <span className={`user-status-badge ${user.status === 'Active' || user.status === 'Approved' ? 'active' : 'suspended'}`}>
                      {user.status}
                    </span>
                    <button className="user-action-btn" onClick={() => handleViewUser(user)}>
                      <img src="/Images/see.svg" alt="View" />
                    </button>
                    {user.status === 'Active' || user.status === 'Approved' ? (
                      <button className="user-action-btn suspend" onClick={() => handleSuspendUser(user.user_id)}>Suspend</button>
                    ) : (
                      <button className="user-action-btn activate" onClick={() => handleActivateUser(user.user_id)}>Activate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 2 && (
          <div className="card">
            <div className="card-title">Reports</div>
            <div className="card-desc">View submitted reports for providers and pet owners.</div>
            {/* Sub-tabs for Reports */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 18, marginTop: 8 }}>
              <button
                className={reportSubTab === 'provider' ? 'user-filter-btn active' : 'user-filter-btn'}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: reportSubTab === 'provider' ? '#2563eb' : '#f3f4f6', color: reportSubTab === 'provider' ? '#fff' : '#374151', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setReportSubTab('provider')}
              >
                Reports for Provider
              </button>
              <button
                className={reportSubTab === 'owner' ? 'user-filter-btn active' : 'user-filter-btn'}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: reportSubTab === 'owner' ? '#2563eb' : '#f3f4f6', color: reportSubTab === 'owner' ? '#fff' : '#374151', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setReportSubTab('owner')}
              >
                Reports for Pet Owners
              </button>
            </div>
            {/* Provider Reports Table */}
            {reportSubTab === 'provider' && (
              isLoadingReports ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>Loading reports...</div>
              ) : providerReports.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No reports submitted yet.</div>
              ) : (
                <div style={{ overflowX: 'auto', marginTop: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Provider Reported</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Reporter</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Reason</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providerReports.map(report => (
                        <tr key={report.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px', fontSize: '0.97rem', color: '#374151' }}>{new Date(report.created_at).toLocaleString()}</td>
                          <td style={{ padding: '10px', fontSize: '0.97rem' }}>
                            {report.provider ? `${report.provider.first_name || ''} ${report.provider.last_name || ''}` : 'Unknown'}
                            <div style={{ color: '#6b7280', fontSize: '0.92rem' }}>{report.provider?.email || ''}</div>
                          </td>
                          <td style={{ padding: '10px', fontSize: '0.97rem' }}>
                            {report.reporter ? `${report.reporter.first_name || ''} ${report.reporter.last_name || ''}` : 'Unknown'}
                            <div style={{ color: '#6b7280', fontSize: '0.92rem' }}>{report.reporter?.email || ''}</div>
                          </td>
                          <td style={{ padding: '10px', fontSize: '0.97rem', color: '#ef4444', fontWeight: 500 }}>{report.reason}</td>
                          <td style={{ padding: '10px', fontSize: '0.97rem', cursor: 'pointer' }} onClick={() => setViewedReport(report)}>
                            {report.details && report.details.length > 40
                              ? report.details.slice(0, 40) + '...'
                              : (report.details || <span style={{ color: '#888' }}>-</span>)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
            {/* Pet Owner Reports Placeholder */}
            {reportSubTab === 'owner' && (
              isLoadingPetOwnerReports ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>Loading reports...</div>
              ) : petOwnerReports.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No reports for pet owners yet.</div>
              ) : (
                <div style={{ overflowX: 'auto', marginTop: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Pet Owner Reported</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Reporter</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Reason</th>
                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {petOwnerReports.map(report => (
                        <tr key={report.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px', fontSize: '0.97rem', color: '#374151' }}>{new Date(report.created_at).toLocaleString()}</td>
                          <td style={{ padding: '10px', fontSize: '0.97rem' }}>
                            {report.pet_owner ? `${report.pet_owner.first_name || ''} ${report.pet_owner.last_name || ''}` : 'Unknown'}
                            <div style={{ color: '#6b7280', fontSize: '0.92rem' }}>{report.pet_owner?.email || ''}</div>
                          </td>
                          <td style={{ padding: '10px', fontSize: '0.97rem' }}>
                            {report.reporter ? `${report.reporter.first_name || ''} ${report.reporter.last_name || ''}` : 'Unknown'}
                            <div style={{ color: '#6b7280', fontSize: '0.92rem' }}>{report.reporter?.email || ''}</div>
                          </td>
                          <td style={{ padding: '10px', fontSize: '0.97rem', color: '#ef4444', fontWeight: 500 }}>{report.reason}</td>
                          <td style={{ padding: '10px', fontSize: '0.97rem', cursor: 'pointer' }} title={report.details} onClick={() => setViewedPetOwnerReport(report)}>
                            {report.details && report.details.length > 40
                              ? report.details.slice(0, 40) + '...'
                              : (report.details || <span style={{ color: '#888' }}>-</span>)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}

        {/* Analytics Tab (now index 3) */}
        {activeTab === 3 && (
          <div className="card analytics-card-transparent">
            <div className="analytics-container">
              <div className="analytics-header">
                <div>
                  <div className="analytics-title">Platform Analytics</div>
                  <div className="analytics-subtitle">Monitor platform metrics and user activity</div>
                </div>
                <div className="analytics-controls">
                  <div className="analytics-period-dropdown">
                    <button className="user-filter-btn analytics-period-btn" onClick={() => setShowAnalyticsDropdown(open => !open)}>
                      {analyticsPeriod} <img src="/Images/filter.svg" alt="dropdown" />
                    </button>
                    {showAnalyticsDropdown && (
                      <div className="analytics-dropdown">
                        {['Last 7 days', 'Last 30 days', 'Last 90 days'].map(period => (
                          <div
                            key={period}
                            className={`analytics-dropdown-item ${analyticsPeriod === period ? 'active' : ''}`}
                            onClick={() => { handleAnalyticsPeriodChange(period); setShowAnalyticsDropdown(false); }}
                          >{period}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={handleExport} className="user-filter-btn export-btn">Export</button>
                </div>
              </div>
              <div className="analytics-stats-grid">
                {isLoadingAnalytics ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="analytics-stat-card">
                      <div className="analytics-stat-header">
                        <div className="analytics-stat-icon-skeleton"></div>
                        <div className="analytics-stat-label-skeleton"></div>
                      </div>
                      <div className="analytics-stat-value-skeleton"></div>
                      <div className="analytics-stat-change-skeleton"></div>
                    </div>
                  ))
                ) : (
                  analyticsStats.map(stat => (
                    <div key={stat.label} className="analytics-stat-card">
                      <div className="analytics-stat-header">
                        <img src={`/Icons/${stat.icon}`} alt="icon" className="analytics-stat-icon" />
                        <span className="analytics-stat-label">{stat.label}</span>
                      </div>
                      <div className="analytics-stat-value">{stat.value}</div>
                      <div className="analytics-stat-change">{stat.change} <span className="analytics-stat-desc">{stat.desc}</span></div>
                    </div>
                  ))
                )}
              </div>
              <div className="analytics-charts-grid">
                {/* Platform Growth Card */}
                <div className="platform-growth-card">
                  <div className="platform-growth-header">
                    <div className="platform-growth-title">Platform Growth</div>
                    <button className="chart-toggle-btn">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="#2563eb"><rect x="3" y="12" width="3" height="5"/><rect x="8.5" y="8" width="3" height="9"/><rect x="14" y="4" width="3" height="13"/></svg>
                    </button>
                  </div>
                  {/* Bar Chart: Dynamic chart based on real data */}
                  {isLoadingAnalytics ? (
                    <div className="chart-loading-placeholder">Loading chart data...</div>
                  ) : analyticsData.platformGrowth.length > 0 ? (
                    <div>
                      <svg width="100%" height="180" viewBox="0 0 380 180">
                      {/* Grid lines */}
                      <g stroke="#e5e7eb" strokeWidth="1">
                        <line x1="50" y1="30" x2="350" y2="30" />
                        <line x1="50" y1="60" x2="350" y2="60" />
                        <line x1="50" y1="90" x2="350" y2="90" />
                        <line x1="50" y1="120" x2="350" y2="120" />
                        <line x1="50" y1="150" x2="350" y2="150" />
                      </g>
                      
                      {/* Calculate max values for scaling */}
                      {(() => {
                        const maxBookings = Math.max(...analyticsData.platformGrowth.map(d => d.bookings), 1);
                        const maxRevenue = Math.max(...analyticsData.platformGrowth.map(d => d.revenue), 1);
                        const maxValue = Math.max(maxBookings, maxRevenue);
                        
                        return (
                          <>
                            {/* Y axis labels */}
                            <text x="38" y="35" fontSize="11" fill="#6b7280">{Math.ceil(maxValue * 0.8)}</text>
                            <text x="38" y="65" fontSize="11" fill="#6b7280">{Math.ceil(maxValue * 0.6)}</text>
                            <text x="38" y="95" fontSize="11" fill="#6b7280">{Math.ceil(maxValue * 0.4)}</text>
                            <text x="38" y="125" fontSize="11" fill="#6b7280">{Math.ceil(maxValue * 0.2)}</text>
                            <text x="38" y="155" fontSize="11" fill="#6b7280">0</text>
                            
                            {/* Bars: Dynamic bars based on real data */}
                            <g>
                              {analyticsData.platformGrowth.map((data, index) => {
                                const x = 50 + (index * 50);
                                const bookingHeight = (data.bookings / maxValue) * 120;
                                const revenueHeight = (data.revenue / maxValue) * 120;
                                const bookingY = 150 - bookingHeight;
                                const revenueY = 150 - revenueHeight;
                                const date = new Date(data.date);
                                const dateLabel = date.toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                });
                                
                                return (
                                  <g key={index}>
                                    {/* Booking bar with tooltip */}
                                    <rect 
                                      x={x} 
                                      y={bookingY} 
                                      width="14" 
                                      height={bookingHeight} 
                                      fill="#2563eb" 
                                      rx="3"
                                      style={{ cursor: 'pointer' }}
                                      onMouseEnter={(e) => {
                                        const rect = e.target.getBoundingClientRect();
                                        showTooltip(
                                          `<strong>${dateLabel}</strong><br/>
                                           <span style="color: #2563eb;">📊 Bookings: ${data.bookings}</span><br/>
                                           <span style="color: #10b981;">💰 Revenue: ₱${data.revenue.toLocaleString()}</span>`,
                                          rect.left + rect.width / 2,
                                          rect.top - 10
                                        );
                                      }}
                                      onMouseLeave={hideTooltip}
                                    />
                                    {/* Revenue bar with tooltip */}
                                    <rect 
                                      x={x + 16} 
                                      y={revenueY} 
                                      width="14" 
                                      height={revenueHeight} 
                                      fill="#10b981" 
                                      rx="3"
                                      style={{ cursor: 'pointer' }}
                                      onMouseEnter={(e) => {
                                        const rect = e.target.getBoundingClientRect();
                                        showTooltip(
                                          `<strong>${dateLabel}</strong><br/>
                                           <span style="color: #2563eb;">📊 Bookings: ${data.bookings}</span><br/>
                                           <span style="color: #10b981;">💰 Revenue: ₱${data.revenue.toLocaleString()}</span>`,
                                          rect.left + rect.width / 2,
                                          rect.top - 10
                                        );
                                      }}
                                      onMouseLeave={hideTooltip}
                                    />
                                  </g>
                                );
                              })}
                            </g>
                            
                            {/* X axis labels */}
                            {analyticsData.platformGrowth.map((data, index) => {
                              const x = 50 + (index * 50);
                              const date = new Date(data.date);
                              const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              
                              return (
                                <text key={index} x={x + 7} y="170" fontSize="10" fill="#6b7280">{label}</text>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                    {/* Chart Legend */}
                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color bookings"></div>
                        <span>Bookings</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color revenue"></div>
                        <span>Revenue</span>
                      </div>
                    </div>
                  </div>
                  ) : (
                    <div className="empty-chart-placeholder">No data available</div>
                  )}
                </div>
                {/* Service Distribution Card */}
                <div className="service-distribution-card">
                  <div className="service-distribution-title">Service Distribution</div>
                  <div className="service-distribution-subtitle">Platform-wide service popularity</div>
                  {/* Pie Chart: Dynamic chart based on real service distribution */}
                  {isLoadingAnalytics ? (
                    <div className="chart-loading-placeholder">Loading chart data...</div>
                  ) : analyticsData.serviceDistribution.length > 0 ? (
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle r="60" cx="70" cy="70" fill="#f3f4f6" />
                      {(() => {
                        const colors = ['#2563eb', '#10b981', '#f59e42', '#ef4444', '#8b5cf6', '#06b6d4'];
                        let currentAngle = 0;
                        
                        return analyticsData.serviceDistribution.map((service, index) => {
                          const percentage = service.percentage;
                          const angle = (percentage / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;
                          
                          // Convert angles to radians
                          const startRad = (startAngle - 90) * Math.PI / 180;
                          const endRad = (endAngle - 90) * Math.PI / 180;
                          
                          // Calculate arc coordinates
                          const x1 = 70 + 60 * Math.cos(startRad);
                          const y1 = 70 + 60 * Math.sin(startRad);
                          const x2 = 70 + 60 * Math.cos(endRad);
                          const y2 = 70 + 60 * Math.sin(endRad);
                          
                          // Create arc path
                          const largeArcFlag = angle > 180 ? 1 : 0;
                          const path = [
                            `M70 70`,
                            `L${x1} ${y1}`,
                            `A60 60 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            'Z'
                          ].join(' ');
                          
                          currentAngle += angle;
                          
                          return (
                            <path 
                              key={service.type} 
                              d={path} 
                              fill={colors[index % colors.length]}
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={(e) => {
                                const rect = e.target.getBoundingClientRect();
                                showTooltip(
                                  `<strong>${service.type}</strong><br/>
                                   <span style="color: ${colors[index % colors.length]};">📊 Count: ${service.count}</span><br/>
                                   <span style="color: ${colors[index % colors.length]};">📈 Percentage: ${service.percentage.toFixed(1)}%</span>`,
                                  rect.left + rect.width / 2,
                                  rect.top - 10
                                );
                              }}
                              onMouseLeave={hideTooltip}
                            />
                          );
                        });
                      })()}
                    </svg>
                  ) : (
                    <div className="empty-chart-placeholder">No data available</div>
                  )}
                </div>
              </div>
              <div className="analytics-charts-grid">
                <div className="top-providers-card">
                  <div className="top-providers-title">Top Performing Providers</div>
                  <div className="top-providers-subtitle">Highest rated and most active service providers</div>
                  <div className="top-providers-list">
                    {isLoadingAnalytics ? (
                      // Loading skeleton
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="provider-item">
                          <div className="provider-info-section">
                            <div className="provider-rank-skeleton"></div>
                            <div className="provider-details">
                              <div className="provider-name-skeleton"></div>
                              <div className="provider-stats-skeleton"></div>
                            </div>
                          </div>
                          <div className="provider-revenue-section">
                            <div className="provider-revenue-skeleton"></div>
                            <div className="provider-revenue-label-skeleton"></div>
                          </div>
                        </div>
                      ))
                    ) : topProviders.length > 0 ? (
                      topProviders.map((prov, idx) => (
                        <div key={prov.name} className="provider-item">
                          <div className="provider-info-section">
                            <div className="provider-rank">{idx + 1}</div>
                            <div className="provider-details">
                              <div className="provider-name">{prov.name}</div>
                              <div className="provider-stats">
                                {prov.bookings} bookings ·
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="#f59e42"><path d="M10 15.27L16.18 18l-1.64-7.03L19 7.24l-7.19-.61L10 0 8.19 6.63 1 7.24l5.46 3.73L4.82 18z"/></svg>
                                {prov.rating}
                              </div>
                            </div>
                          </div>
                          <div className="provider-revenue-section">
                            <div className="provider-revenue">₱{prov.revenue.toLocaleString()}</div>
                            <div className="provider-revenue-label">revenue</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-providers-message">
                        <p>No provider data available for the selected period.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Tooltip */}
        {tooltip.show && (
          <div 
            className="chart-tooltip"
            style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translateX(-50%) translateY(-100%)',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
            dangerouslySetInnerHTML={{ __html: tooltip.content }}
          />
        )}
      </div>

      {viewedDocument && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">
              {viewedDocument.doc.type}
            </div>
            <div className="modal-field">
              <strong>Filename:</strong> {viewedDocument.doc.filename}
            </div>
            <div className="modal-field">
              <strong>Provider:</strong> {viewedDocument.provider.name}
            </div>
            {viewedDocument.doc.url && (
              <div className="modal-field">
                <strong>Document:</strong>
                <div style={{ marginTop: '10px' }}>
                  {viewedDocument.doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img 
                      src={viewedDocument.doc.url} 
                      alt={viewedDocument.doc.filename}
                      style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                      <p>📄 {viewedDocument.doc.filename}</p>
                      <p style={{ fontSize: '14px', color: '#666' }}>This is a document file</p>
                    </div>
                  )}
                  <button 
                    onClick={() => window.open(viewedDocument.doc.url, '_blank')}
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Open Document
                  </button>
                </div>
              </div>
            )}
            <button onClick={handleCloseDocument} className="modal-close-btn">Close</button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal-content">
            <div className="logout-modal-title">Confirm Logout</div>
            <div className="logout-modal-message">Are you sure you want to logout?</div>
            <div className="logout-modal-actions">
              <button onClick={handleLogoutCancel} className="logout-modal-cancel-btn">Cancel</button>
              <button onClick={handleLogoutConfirm} className="logout-modal-confirm-btn">Logout</button>
            </div>
          </div>
        </div>
      )}

      {viewedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">
              User Details
            </div>
            <div className="modal-field">
              <strong>Name:</strong> {viewedUser.name}
            </div>
            <div className="modal-field">
              <strong>Email:</strong> {viewedUser.email}
            </div>
            <div className="modal-field">
              <strong>Role:</strong> {viewedUser.role}
            </div>
            <div className="modal-field">
              <strong>Joined:</strong> {viewedUser.joined}
            </div>
            <div className="modal-field">
              <strong>Bookings:</strong> {viewedUser.bookings}
            </div>
            <div className="modal-field">
              <strong>Status:</strong> {viewedUser.status}
            </div>
            <button onClick={handleCloseUser} className="modal-close-btn">Close</button>
          </div>
        </div>
      )}

      {showExportMsg && (
        <div className="export-message">
          Exported!
        </div>
      )}

      {/* Report Details Modal */}
      {viewedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">Report Details</div>
            <div className="modal-field"><strong>Date:</strong> {new Date(viewedReport.created_at).toLocaleString()}</div>
            <div className="modal-field"><strong>Provider Reported:</strong> {viewedReport.provider ? `${viewedReport.provider.first_name || ''} ${viewedReport.provider.last_name || ''}` : 'Unknown'} <span style={{ color: '#6b7280', fontSize: '0.92rem' }}>{viewedReport.provider?.email || ''}</span></div>
            <div className="modal-field"><strong>Reporter:</strong> {viewedReport.reporter ? `${viewedReport.reporter.first_name || ''} ${viewedReport.reporter.last_name || ''}` : 'Unknown'} <span style={{ color: '#6b7280', fontSize: '0.92rem' }}>{viewedReport.reporter?.email || ''}</span></div>
            <div className="modal-field"><strong>Reason:</strong> <span style={{ color: '#ef4444', fontWeight: 500 }}>{viewedReport.reason}</span></div>
            <div className="modal-field" style={{ maxWidth: 500, wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflowY: 'auto', maxHeight: 300 }}><strong>Details:</strong><br />{viewedReport.details || <span style={{ color: '#888' }}>-</span>}</div>
            <button className="modal-close-btn" onClick={() => setViewedReport(null)} style={{ marginTop: 18 }}>Close</button>
          </div>
        </div>
      )}

      {viewedPetOwnerReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">Report Details</div>
            <div className="modal-field"><strong>Date:</strong> {new Date(viewedPetOwnerReport.created_at).toLocaleString()}</div>
            <div className="modal-field"><strong>Pet Owner Reported:</strong> {viewedPetOwnerReport.pet_owner ? `${viewedPetOwnerReport.pet_owner.first_name || ''} ${viewedPetOwnerReport.pet_owner.last_name || ''}` : 'Unknown'} <span style={{ color: '#6b7280', fontSize: '0.92rem' }}>{viewedPetOwnerReport.pet_owner?.email || ''}</span></div>
            <div className="modal-field"><strong>Reporter:</strong> {viewedPetOwnerReport.reporter ? `${viewedPetOwnerReport.reporter.first_name || ''} ${viewedPetOwnerReport.reporter.last_name || ''}` : 'Unknown'} <span style={{ color: '#6b7280', fontSize: '0.92rem' }}>{viewedPetOwnerReport.reporter?.email || ''}</span></div>
            <div className="modal-field"><strong>Reason:</strong> <span style={{ color: '#ef4444', fontWeight: 500 }}>{viewedPetOwnerReport.reason}</span></div>
            <div className="modal-field" style={{ maxWidth: 500, wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflowY: 'auto', maxHeight: 300 }}><strong>Details:</strong><br />{viewedPetOwnerReport.details || <span style={{ color: '#888' }}>-</span>}</div>
            <button className="modal-close-btn" onClick={() => setViewedPetOwnerReport(null)} style={{ marginTop: 18 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const tabs = [
  { label: 'Service Provider Approvals' },
  { label: 'All Users' },
  { label: 'Reports' }, // Added Reports tab
  { label: 'Analytics' },
];

// If you want to require certain documents for providers, list them here:
const requiredDocuments = ['Certificate', 'Valid ID', 'Proof of Address'];

// Helper to get missing documents for a provider
const getMissingDocuments = (provider) => {
  const uploadedTypes = provider.documents.map(doc => doc.type);
  return requiredDocuments.filter(req => !uploadedTypes.includes(req));
};

// Analytics data is now fetched from the database

function sortList(list, sortType) {
  const sorted = [...list];
  if (sortType === 'A-Z') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortType === 'Z-A') {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortType === 'Oldest') {
    sorted.sort((a, b) => new Date(a.joined) - new Date(b.joined));
  } else if (sortType === 'Latest') {
    sorted.sort((a, b) => new Date(b.joined) - new Date(a.joined));
  }
  return sorted;
}

function getServiceIcon(serviceType) {
  switch ((serviceType || '').toLowerCase()) {
    case 'dog walking':
      return '/images/dog-leash.png';
    case 'pet grooming':
      return '/images/dog-cat.png';
    case 'pet sitting':
      return '/images/dog-human.png';
    case 'veterinary':
      return '/images/dog-background.png';
    default:
      return '/images/dogies.png';
  }
}

export default AdminDashboard;
