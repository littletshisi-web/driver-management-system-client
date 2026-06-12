import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../constants/roles.js';
import PageShell from '../components/layout/PageShell.jsx';
import TableCard from '../components/tables/TableCard.jsx';
import styles from './Help.module.css';

// ─── Static content — no API required ────────────────────────────────────────
const CONTACTS = {
  [ROLES.ADMIN]: [
    { icon: '🛠',  title: 'Technical Support', info: 'info@danigroup.co.za',          sub: 'System issues & bugs'       },
    { icon: '📋', title: 'Operations Team',   info: '0785573668',           sub: 'Operational queries'        },
    { icon: '💼', title: 'Management',         info: 'info@danigrou.co.za',     sub: 'Escalations & policy'       },
  ],
  [ROLES.PARTNER]: [
    { icon: '🤝', title: 'Partner Support',   info: 'info@danigroup.co.za',       sub: 'Mon–Fri 8 am – 5 pm'        },
    { icon: '📞', title: 'Ops Hotline',        info: '0785573668',           sub: 'Task & driver queries'      },
    { icon: '💬', title: 'WhatsApp Support',   info: '0785573668',           sub: 'Quick responses'            },
  ],
  [ROLES.DRIVER]: [
    { icon: '🚗', title: 'Driver Support',    info: 'info@danigroup.co.za',        sub: 'Mon–Fri 7 am – 6 pm'        },
    { icon: '📞', title: '24/7 Hotline',       info: '0785573668',           sub: 'Urgent task issues'         },
    { icon: '💬', title: 'WhatsApp Support',   info: '0785573668',           sub: 'Quick help'                 },
  ],
};

const FAQS = {
  [ROLES.ADMIN]: [
    {
      q: 'How do I assign a driver to a partner?',
      a: 'Go to Drivers, find the driver, click Edit, and change the "Assign to Partner" dropdown. The driver immediately appears on the partner\'s dashboard. The frontend calls POST /api/drivers/:id/assign-partner with the partnerId.',
    },
    {
      q: 'How is task pricing calculated?',
      a: 'The formula is: (base fee + distance × rate per km) × area modifier × category modifier. All values are configurable in the Pricing section. The frontend calls POST /api/pricing/calculate to get a server-computed price.',
    },
    {
      q: 'What does the audit log track?',
      a: 'All sensitive actions: logins, task assignments, driver-partner changes, pricing updates, and admin changes. Logs are retained for 12 months and loaded via GET /api/audit.',
    },
    {
      q: 'How do I suspend a driver?',
      a: 'Go to Drivers and click Suspend on the relevant row. This calls PATCH /api/drivers/:id/suspend. The driver status updates to Inactive and they can no longer be assigned to new tasks.',
    },
  ],
  [ROLES.PARTNER]: [
    {
      q: 'How do I assign a task to one of my drivers?',
      a: 'Go to Tasks, click New Task, select the category and driver, fill in service details, and submit. The frontend calls POST /api/tasks with the driverId and your partnerId.',
    },
    {
      q: 'Can I view drivers not assigned to my company?',
      a: 'Only if Admin has enabled this in settings. When allowed, unpartnered drivers appear in the Drivers section, loaded via GET /api/drivers?partnerId=none.',
    },
    {
      q: 'How do I view my monthly earnings report?',
      a: 'Go to Reports. Your earnings are automatically filtered by your partnerId. The page loads from GET /api/reports/earnings?partnerId=YOUR_ID with optional date filters.',
    },
  ],
  [ROLES.DRIVER]: [
    {
      q: 'How do I update a task status?',
      a: 'Go to My Tasks, find the assigned task, and click the progress button to move it from Assigned → In Progress → Completed. Each click calls PATCH /api/tasks/:id/status.',
    },
    {
      q: 'How are my earnings calculated?',
      a: 'Earnings = task final price minus your partner\'s commission percentage. Calculated server-side and visible in your Earnings page via GET /api/reports/earnings?driverId=YOUR_ID.',
    },
    {
      q: 'Who do I contact for a task issue?',
      a: 'Contact your partner\'s support line first. For urgent system issues, use the contact form above to reach admin support directly.',
    },
  ],
};

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.open : ''}`}>
      <button className={styles.faqQ} onClick={() => setOpen((v) => !v)}>
        {question}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className={styles.faqA}>{answer}</div>}
    </div>
  );
}

export default function Help() {
  const { user } = useAuth();
  const contacts = CONTACTS[user?.role] ?? [];
  const faqs     = FAQS[user?.role] ?? [];

  const subtitles = {
    [ROLES.ADMIN]:   'Admin support, documentation, and system guides',
    [ROLES.PARTNER]: 'Partner support and operational assistance',
    [ROLES.DRIVER]:  'Driver support, task help, and earnings queries',
  };

  return (
    <PageShell
      title="Help & Support"
      subtitle={subtitles[user?.role] ?? 'Find answers and get in touch'}
    >
      {/* Contact cards */}
      <div className={styles.contactGrid}>
        {contacts.map((c, i) => (
          <div key={i} className={styles.contactCard}>
            <div className={styles.contactIcon}>{c.icon}</div>
            <div className={styles.contactTitle}>{c.title}</div>
            <div className={styles.contactInfo}>{c.info}</div>
            <div className={styles.contactSub}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <TableCard title="Frequently asked questions">
        <div className={styles.faqWrap}>
          {faqs.map((f, i) => (
            <FaqItem key={i} question={f.q} answer={f.a} />
          ))}
        </div>
      </TableCard>
    </PageShell>
  );
}
