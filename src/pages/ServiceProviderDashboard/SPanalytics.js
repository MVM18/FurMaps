import './SPanalytics.css';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const SPAnalytics = () => {
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: { value: 0, change: 0 },
    bookings: { value: 0, change: 0 },
    rating: { value: 0, change: 0 },
    chartData: [],
    serviceBreakdown: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [providerId, setProviderId] = useState(null);

  const timeRanges = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 6 months', 'Last year'];

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProviderId(user.id);
        fetchAnalyticsData(user.id);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (providerId) {
      fetchAnalyticsData(providerId);
    }
  }, [timeRange, providerId]);

  const getDaysFromRange = (range) => {
    switch (range) {
      case 'Last 7 days': return 7;
      case 'Last 30 days': return 30;
      case 'Last 90 days': return 90;
      case 'Last 6 months': return 180;
      case 'Last year': return 365;
      default: return 30;
    }
  };

  const fetchAnalyticsData = async (userId) => {
    try {
      setIsLoading(true);
      const days = getDaysFromRange(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch bookings for the selected period
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, status, total_price, created_at, services(name)')
        .eq('service_provider_id', userId)
        .gte('created_at', startDate.toISOString());

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return;
      }

      // Fetch previous period data for comparison
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - days);
      const { data: prevBookings, error: prevError } = await supabase
        .from('bookings')
        .select('id, status, total_price, created_at')
        .eq('service_provider_id', userId)
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      if (prevError) {
        console.error('Error fetching previous period data:', prevError);
      }

      // Calculate current period metrics
      const currentRevenue = bookings
        .filter(b => ['accepted', 'confirmed', 'completed'].includes(b.status))
        .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      
      const currentBookings = bookings.length;

      // Calculate previous period metrics
      const prevRevenue = (prevBookings || [])
        .filter(b => ['accepted', 'confirmed', 'completed'].includes(b.status))
        .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      
      const prevBookingsCount = (prevBookings || []).length;

      // Calculate percentage changes
      const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      const bookingsChange = prevBookingsCount > 0 ? ((currentBookings - prevBookingsCount) / prevBookingsCount) * 100 : 0;

      // Fetch reviews for rating calculation
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating, created_at')
        .eq('service_provider_id', userId)
        .gte('created_at', startDate.toISOString());

      const currentRating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      // Generate chart data (last 6 months)
      const chartData = generateChartData(bookings, days);

      // Generate service breakdown
      const serviceBreakdown = generateServiceBreakdown(bookings);

      setAnalyticsData({
        revenue: { value: currentRevenue, change: revenueChange },
        bookings: { value: currentBookings, change: bookingsChange },
        rating: { value: currentRating, change: 4.3 }, // Mock rating change
        chartData,
        serviceBreakdown
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = (bookings, days) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];

    if (days <= 30) {
      // Weekly data for last 30 days
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekBookings = bookings.filter(b => {
          const bookingDate = new Date(b.created_at);
          return bookingDate >= new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000) && 
                 bookingDate < weekStart;
        });
        data.unshift({
          period: `Week ${4 - i}`,
          bookings: weekBookings.length,
          revenue: weekBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0)
        });
      }
    } else {
      // Monthly data for longer periods
      for (let i = 0; i < 6; i++) {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthBookings = bookings.filter(b => {
          const bookingDate = new Date(b.created_at);
          return bookingDate.getMonth() === month.getMonth() && 
                 bookingDate.getFullYear() === month.getFullYear();
        });
        data.unshift({
          period: months[month.getMonth()],
          bookings: monthBookings.length,
          revenue: monthBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0)
        });
      }
    }

    return data;
  };

  const generateServiceBreakdown = (bookings) => {
    const services = {};
    bookings.forEach(booking => {
      const serviceName = booking.services?.name || 'Unknown Service';
      if (!services[serviceName]) {
        services[serviceName] = 0;
      }
      services[serviceName]++;
    });

    const total = Object.values(services).reduce((sum, count) => sum + count, 0);
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    return Object.entries(services)
      .map(([name, count], index) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setIsDropdownOpen(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="analytics-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <div className="header-text">
            <h2 className="analytics-title">Performance Dashboard</h2>
            <p className="analytics-subtitle">Track your business performance and growth</p>
          </div>
          <div className="time-range-selector">
            <div className="dropdown-container">
              <button 
                className="dropdown-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{timeRange}</span>
                <svg className="dropdown-arrow" viewBox="0 0 16 16">
                  <path d="M4.427 9.573L8 6l3.573 3.573"/>
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      className={`dropdown-item ${timeRange === range ? 'active' : ''}`}
                      onClick={() => handleTimeRangeChange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card revenue-card">
          <div className="stat-content">
            <div className="stat-header">
              <h3 className="stat-title">Revenue</h3>
              <svg className="stat-icon" viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="stat-value">{formatCurrency(analyticsData.revenue.value)}</div>
            <div className="stat-change">
              <svg className="change-icon positive" viewBox="0 0 20 16">
                <path d="M10 1L19 15H1L10 1z"/>
              </svg>
              <span className="change-percentage positive">
                {formatPercentage(analyticsData.revenue.change)}
              </span>
              <span className="change-label">vs last period</span>
            </div>
          </div>
        </div>

        <div className="stat-card bookings-card">
          <div className="stat-content">
            <div className="stat-header">
              <h3 className="stat-title">Bookings</h3>
              <svg className="stat-icon" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div className="stat-value">{analyticsData.bookings.value}</div>
            <div className="stat-change">
              <svg className="change-icon positive" viewBox="0 0 20 16">
                <path d="M10 1L19 15H1L10 1z"/>
              </svg>
              <span className="change-percentage positive">
                {formatPercentage(analyticsData.bookings.change)}
              </span>
              <span className="change-label">vs last period</span>
            </div>
          </div>
        </div>

        <div className="stat-card rating-card">
          <div className="stat-content">
            <div className="stat-header">
              <h3 className="stat-title">Average Rating</h3>
              <svg className="stat-icon" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="stat-value">{analyticsData.rating.value.toFixed(1)}</div>
            <div className="stat-change">
              <svg className="change-icon positive" viewBox="0 0 20 16">
                <path d="M10 1L19 15H1L10 1z"/>
              </svg>
              <span className="change-percentage positive">
                {formatPercentage(analyticsData.rating.change)}
              </span>
              <span className="change-label">vs last period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Revenue & Bookings Chart */}
        <div className="chart-card main-chart">
          <div className="chart-header">
            <h3 className="chart-title">Revenue & Bookings Trend</h3>
            <div className="chart-controls">
              <button className="chart-control active">Revenue</button>
              <button className="chart-control">Bookings</button>
            </div>
          </div>
          <div className="chart-content">
            <div className="chart-container">
              <svg className="chart-svg" viewBox="0 0 622 320">
                {/* Y-axis labels */}
                <g className="y-axis">
                  <text x="20" y="40" className="axis-label">2600</text>
                  <text x="20" y="100" className="axis-label">1950</text>
                  <text x="20" y="160" className="axis-label">1300</text>
                  <text x="20" y="220" className="axis-label">650</text>
                  <text x="20" y="280" className="axis-label">0</text>
                </g>
                
                {/* X-axis labels */}
                <g className="x-axis">
                  {analyticsData.chartData.map((item, index) => (
                    <text 
                      key={index} 
                      x={80 + (index * 80)} 
                      y="310" 
                      className="axis-label"
                    >
                      {item.period}
                    </text>
                  ))}
                </g>

                {/* Chart bars */}
                <g className="chart-bars">
                  {analyticsData.chartData.map((item, index) => {
                    const maxRevenue = Math.max(...analyticsData.chartData.map(d => d.revenue));
                    const barHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * 200 : 0;
                    return (
                      <rect
                        key={index}
                        x={60 + (index * 80)}
                        y={280 - barHeight}
                        width="40"
                        height={barHeight}
                        fill="#10b981"
                        rx="4"
                        className="chart-bar"
                      />
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="chart-card service-chart">
          <div className="chart-header">
            <h3 className="chart-title">Service Breakdown</h3>
            <p className="chart-subtitle">Your bookings by service type</p>
          </div>
          <div className="chart-content">
            <div className="service-breakdown">
              {analyticsData.serviceBreakdown.length > 0 ? (
                <>
                  <div className="pie-chart">
                    <svg viewBox="0 0 200 200" className="pie-svg">
                      {analyticsData.serviceBreakdown.map((service, index) => {
                        const angle = (service.percentage / 100) * 360;
                        const startAngle = analyticsData.serviceBreakdown
                          .slice(0, index)
                          .reduce((sum, s) => sum + (s.percentage / 100) * 360, 0);
                        
                        const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = 100 + 80 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                        const y2 = 100 + 80 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                        
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        
                        return (
                          <path
                            key={index}
                            d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                            fill={service.color}
                            className="pie-slice"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="service-legend">
                    {analyticsData.serviceBreakdown.map((service, index) => (
                      <div key={index} className="legend-item">
                        <div 
                          className="legend-color" 
                          style={{ backgroundColor: service.color }}
                        ></div>
                        <span className="legend-label">{service.name}</span>
                        <span className="legend-percentage">
                          {service.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-data">
                  <p>No service data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SPAnalytics;