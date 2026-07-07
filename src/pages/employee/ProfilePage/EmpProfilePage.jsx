import React, { useState } from 'react';
import {
  Menu, LayoutDashboard, User, Users, Clock, ListChecks, CalendarClock,
  Award, ClipboardList, CalendarDays, FileEdit, Mail, Search, Sun, Moon,
  Bell, Headphones, Settings, ChevronDown, ChevronRight, Camera, BadgeCheck,
  Phone, MailOpen, Cake, MapPin, UserRound, Users2, ShieldCheck, Pencil,
  UserCircle2, FolderClosed, Info, IdCard, Landmark, Briefcase, Plane,
  GraduationCap
} from 'lucide-react';
import './EmpProfilePage.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'View Profile', icon: User, active: true },
  { label: 'Attendance', icon: Clock, expandable: true },
  { label: 'Work Management', icon: ListChecks, expandable: true },
  { label: 'Leave Management', icon: CalendarClock, expandable: true },
  { label: 'Assign Project', icon: Award, expandable: true },
  { label: 'Calendar & Holidays', icon: CalendarDays, expandable: true },
  { label: 'Post', icon: FileEdit },
  { label: 'Message Center', icon: Mail, badge: 54 },
];

const TABS = [
  { label: 'Profile', icon: UserCircle2 },
  { label: 'Personal Information', icon: Users2 },
  { label: 'Work Information', icon: Briefcase },
  { label: 'Documents', icon: FolderClosed },
  { label: 'Additional Information', icon: Info },
];

const CONTACT_INFO = [
  { icon: Phone, label: 'Phone:', value: 'Not provided', link: false },
  { icon: MailOpen, label: 'Email:', value: 'sekhshamim918@gmail.com', link: true },
  { icon: Cake, label: 'Birthday:', value: '10 March 1994', link: false },
  { icon: MapPin, label: 'Address:', value: 'Mondal Ghatnhi, Koikhali, Kolkata, United Kingdom, 700052', link: false },
  { icon: UserRound, label: 'Gender:', value: 'Male', link: false },
  { icon: Users2, label: 'Reports to:', value: 'SWC1', link: true },
];

const EmpProfilePage = () => {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className="epp-wrapper">
     

      {/* Main */}
      <div className="epp-main">
      

        <main className="epp-content">
          {/* Profile header card */}
          <section className="epp-header-card">
            <div className="epp-profile-block">
              <div className="epp-avatar-wrap">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=faces"
                  alt="SK Shamim"
                />
                <div className="epp-camera-badge"><Camera size={14} /></div>
              </div>

              <div className="epp-profile-info">
                <h1>SK SHAMIM <BadgeCheck size={18} className="epp-verified" /></h1>
                <div className="epp-department">DIGITAL MARKETING <Pencil size={12} /></div>
                <div className="epp-jobtitle">MARKETING EXECUTIVE</div>

                <div className="epp-meta-row"><b>Employee ID :</b> <span className="val">SWCS</span></div>
                <div className="epp-meta-row"><b>Date of Join :</b> Not provided</div>

                <button className="epp-edit-btn"><Pencil size={14} /> Edit Profile</button>
              </div>
            </div>

            <div className="epp-contact-grid">
              {CONTACT_INFO.map((c) => (
                <div className="epp-contact-item" key={c.label}>
                  <div className="epp-contact-icon"><c.icon size={15} /></div>
                  <div className="epp-contact-text">
                    <div className="label">{c.label}</div>
                    <div className={`value${c.link ? ' link' : ''}`}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tabs */}
          <nav className="epp-tabs">
            {TABS.map((tab) => (
              <div
                key={tab.label}
                className={`epp-tab${activeTab === tab.label ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.label)}
              >
                <tab.icon size={16} />
                {tab.label}
              </div>
            ))}
          </nav>

          {/* Cards grid */}
          <section className="epp-cards-grid">
            {/* Personal Informations */}
            <div className="epp-card">
              <div className="epp-card-title">
                <span className="epp-card-icon epp-icon-purple"><User size={16} /></span>
                Personal Informations
              </div>
              <div className="epp-kv-grid">
                <KV label="Passport No." value="Not provided" />
                <KV label="Nationality" value="India" />
                <KV label="Passport Exp Date." value="Not provided" />
                <KV label="Religion" value="Not provided" />
                <KV label="Tel" value="+91 629 532 0150" />
                <KV label="Marital status" value="Unmarried" />
                <KV label="" value="" empty />
                <KV label="Employment of spouse" value="N/A" />
                <KV label="" value="" empty />
                <KV label="Spouse Name" value="N/A" />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="epp-card">
              <div className="epp-card-title">
                <span className="epp-card-icon epp-icon-red"><IdCard size={16} /></span>
                Emergency Contact
              </div>
              <div className="epp-simple-list">
                <div className="epp-simple-row"><span className="k" style={{ fontWeight: 700 }}>Primary</span><span /></div>
                <SimpleRow label="Name" value="Sekh Shamim" />
                <SimpleRow label="Relationship" value="Relatives" />
                <SimpleRow label="Phone" value="+91 860 917 2138" />
                <SimpleRow label="Email" value="shamim914@vpemail.com" />
                <SimpleRow label="Address" value="koikhali kolkata" />
              </div>
            </div>

            {/* Bank & Document Information */}
            <div className="epp-card">
              <div className="epp-card-title">
                <span className="epp-card-icon epp-icon-green"><Landmark size={16} /></span>
                Bank &amp; Document Information
              </div>
              <div className="epp-kv-grid">
                <KV label="Bank name" value="Not provided" />
                <KV label="Aadhar No" value="Not provided" />
                <KV label="Bank account No." value="Not provided" />
                <KV label="National Insurance" value="Not provided" />
                <KV label="" value="" empty />
                <KV label="Status" value={<span className="epp-badge active">Active</span>} />
              </div>
            </div>

            {/* Work Information */}
            <div className="epp-card">
              <div className="epp-card-title">
                <span className="epp-card-icon epp-icon-orange"><Briefcase size={16} /></span>
                Work Information
              </div>
              <div className="epp-kv-grid">
                <KV label="Employee Status" value="FULL TIME" />
                <KV label="End Date" value="Not provided" />
                <KV label="Job Location" value="koikhali kolkata" />
                <KV label="Confirmation Date" value="Not provided" />
                <KV label="Start Date" value="Not provided" />
                <KV label="Retirement Date" value="Not provided" />
              </div>
            </div>

            {/* Visa Information */}
            <div className="epp-card">
              <div className="epp-card-title">
                <span className="epp-card-icon epp-icon-blue"><Plane size={16} /></span>
                Visa Information
              </div>
              <div className="epp-kv-grid" style={{ gridTemplateColumns: '1fr' }}>
                <KV label="Visa Document No." value="Not provided" />
                <KV label="Issue Date" value="Not provided" />
                <KV label="Expiry Date" value="Not provided" />
                <KV label="Issued By" value="Not provided" />
                <KV label="Current Status" value={<span className="epp-badge yes">Yes</span>} />
              </div>
            </div>

            {/* Professional License */}
            <div className="epp-card">
              <div className="epp-card-title">
                <span className="epp-card-icon epp-icon-purple"><GraduationCap size={16} /></span>
                Professional License
              </div>
              <div className="epp-kv-grid" style={{ gridTemplateColumns: '1fr' }}>
                <KV label="License Title" value="Not provided" />
                <KV label="License Number" value="Not provided" />
                <KV label="Start Date" value="Not provided" />
                <KV label="End Date" value="Not provided" />
                <KV label="Verification Status" value={<span className="epp-badge not-approved">Not Approved</span>} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const KV = ({ label, value, empty }) => {
  if (empty) return <div />;
  return (
    <div className="epp-kv-row">
      <span className="k">{label}</span>
      <span className="dots" />
      <span className="v">{value}</span>
    </div>
  );
};

const SimpleRow = ({ label, value }) => (
  <div className="epp-simple-row">
    <span className="k">{label}</span>
    <span className="v">{value}</span>
  </div>
);

export default EmpProfilePage;