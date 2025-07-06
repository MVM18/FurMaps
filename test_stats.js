// Test script for stats functionality
// Run this in browser console to test stats data retrieval

const testStats = async () => {
  console.log('🧪 Testing stats functionality...');
  
  try {
    // 1. Test user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return;
    }
    console.log('✅ User authenticated:', user.id);
    
    // 2. Test bookings table access
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status, total_price, created_at, pet_owner_id')
      .eq('service_provider_id', user.id);

    if (bookingsError) {
      console.error('❌ Bookings table access failed:', bookingsError);
      return;
    }
    console.log('✅ Bookings table accessible, found', bookings.length, 'bookings');
    console.log('📊 Sample bookings:', bookings.slice(0, 3));
    
    // 3. Test reviews table access
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at')
      .eq('service_provider_id', user.id);

    if (reviewsError) {
      console.error('❌ Reviews table access failed:', reviewsError);
      return;
    }
    console.log('✅ Reviews table accessible, found', reviews.length, 'reviews');
    console.log('⭐ Sample reviews:', reviews.slice(0, 3));
    
    // 4. Calculate and display stats
    const totalBookings = bookings.length;
    
    // Calculate this month's revenue
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      const isThisMonth = bookingDate >= firstDayOfMonth;
      const isRevenueGenerating = ['accepted', 'confirmed', 'completed'].includes(booking.status);
      return isThisMonth && isRevenueGenerating;
    });
    
    const thisMonthRevenue = thisMonthBookings.reduce((sum, booking) => 
      sum + (parseFloat(booking.total_price) || 0), 0
    );

    // Calculate active clients
    const activeClientIds = new Set();
    bookings.forEach(booking => {
      if (['accepted', 'confirmed', 'completed'].includes(booking.status)) {
        activeClientIds.add(booking.pet_owner_id);
      }
    });
    const activeClients = activeClientIds.size;

    // Calculate average rating
    let averageRating = "0.0";
    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = (totalRating / reviews.length).toFixed(1);
    }

    // Display calculated stats
    console.log('📈 Calculated Statistics:');
    console.log('  - Total Bookings:', totalBookings);
    console.log('  - Average Rating:', averageRating);
    console.log('  - This Month Revenue:', `₱${thisMonthRevenue.toFixed(2)}`);
    console.log('  - Active Clients:', activeClients);
    
    // 5. Test booking status distribution
    const statusCounts = {};
    bookings.forEach(booking => {
      statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
    });
    console.log('📊 Booking Status Distribution:', statusCounts);
    
    // 6. Test recent activity
    const recentBookings = bookings
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    console.log('🕒 Recent Bookings:', recentBookings.map(b => ({
      id: b.id,
      status: b.status,
      created_at: new Date(b.created_at).toLocaleDateString(),
      total_price: b.total_price
    })));
    
    console.log('✅ Stats functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Test specific stat calculation
const testStatCalculation = async (statType) => {
  console.log(`🧪 Testing ${statType} calculation...`);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ User not authenticated');
      return;
    }
    
    switch (statType) {
      case 'bookings':
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id, status, created_at')
          .eq('service_provider_id', user.id);
        console.log('📊 Total bookings:', bookings.length);
        break;
        
      case 'revenue':
        const { data: revenueBookings } = await supabase
          .from('bookings')
          .select('total_price, status, created_at')
          .eq('service_provider_id', user.id)
          .in('status', ['accepted', 'confirmed', 'completed']);
        
        const totalRevenue = revenueBookings.reduce((sum, booking) => 
          sum + (parseFloat(booking.total_price) || 0), 0
        );
        console.log('💰 Total revenue:', `₱${totalRevenue.toFixed(2)}`);
        break;
        
      case 'rating':
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('service_provider_id', user.id);
        
        if (reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = (totalRating / reviews.length).toFixed(1);
          console.log('⭐ Average rating:', averageRating);
        } else {
          console.log('⭐ No reviews found');
        }
        break;
        
      default:
        console.error('❌ Unknown stat type. Use: bookings, revenue, or rating');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Export functions for use in console
window.testStats = testStats;
window.testStatCalculation = testStatCalculation;

console.log('🧪 Stats test functions loaded!');
console.log('📝 Available functions:');
console.log('  - testStats() - Test complete stats functionality');
console.log('  - testStatCalculation(statType) - Test specific stat calculation');
console.log('    statType options: bookings, revenue, rating');
console.log('');
console.log('💡 Run testStats() to start testing...'); 