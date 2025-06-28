import './SPbookings.css';

const OverlayBorderShadowOverlayBlur = () => {
  const bookings = [
    {
      initials: "AS",
      name: "Alice Smith",
      service: "Dog Walking",
      pet: "Golden Retriever - Max",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "confirmed",
      statusColor: "#047857",
      statusBg: "#d1fae5",
      icon: "Icons/done.svg"
    },
    {
      initials: "BJ",
      name: "Bob Johnson",
      service: "Pet Grooming",
      pet: "Persian Cat - Luna",
      date: "2024-01-16",
      time: "2:00 PM",
      status: "pending",
      statusColor: "#a16207",
      statusBg: "#fef9c3",
      icon: "Icons/pending.svg"
    },
    {
      initials: "CD",
      name: "Carol Davis",
      service: "Pet Sitting",
      pet: "Labrador - Buddy",
      date: "2024-01-18",
      time: "9:00 AM",
      status: "completed",
      statusColor: "#1d4ed8",
      statusBg: "#dbeafe",
      icon: "Icons/confirm.svg"
    }
  ];

  return (
    <div className="overlaybordershadowoverlayb">
      <div className="container">
        <div className="heading-3">
          <div className="all-bookings">All Bookings</div>
        </div>
        <div className="margin">
          <div className="heading-3">
            <div className="manage-your-upcoming">Manage your upcoming and past bookings</div>
          </div>
        </div>
      </div>
      
      <div className="container2">
        {bookings.map((booking, index) => (
          <div key={index} className="backgroundborder">
            <div className="container3">
              <div className="container4">
                <div className="container5">
                  <div className="background">
                    <div className="as">{booking.initials}</div>
                  </div>
                </div>
                <div className="margin1">
                  <div className="container6">
                    <div className="container7">
                      <div className="alice-smith">{booking.name}</div>
                    </div>
                    <div className="container8">
                      <div className="dog-walking">{booking.service}</div>
                    </div>
                    <div className="container9">
                      <div className="dog-walking">{booking.pet}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="container6">
              <div className="container11">
                <div className="alice-smith">{booking.date}</div>
              </div>
              <div className="container12">
                <div className="dog-walking">{booking.time}</div>
              </div>
            </div>
            
            <div className="container13" style={{ color: booking.statusColor }}>
              <div className="background1" style={{ backgroundColor: booking.statusBg }}>
                <img className="svg-icon" alt="" src={booking.icon} />
                <div className="margin2">
                  <div className="confirmed">{booking.status}</div>
                </div>
              </div>
              <img className="buttonmargin-icon" alt="" src="Icons/chat.svg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverlayBorderShadowOverlayBlur;