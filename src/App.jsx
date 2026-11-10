import { useEffect, useState } from "react";

const sections = {
  students: { title: "Students", singular: "Student", columns: ["name", "grade", "className", "guardian", "phone"], fields: [
    { name: "name", label: "Full name", required: true }, { name: "grade", label: "Grade", required: true },
    { name: "className", label: "Class", required: true }, { name: "guardian", label: "Guardian" }, { name: "phone", label: "Phone" },
  ] },
  teachers: { title: "Teachers", singular: "Teacher", columns: ["name", "subject", "phone", "email"], fields: [
    { name: "name", label: "Full name", required: true }, { name: "subject", label: "Subject", required: true },
    { name: "phone", label: "Phone" }, { name: "email", label: "Email", type: "email" },
  ] },
  classes: { title: "Classes", singular: "Class", columns: ["name", "teacher", "room", "students"], fields: [
    { name: "name", label: "Class name", required: true }, { name: "teacher", label: "Teacher" },
    { name: "room", label: "Room" }, { name: "students", label: "Number of students", type: "number" },
  ] },
  attendance: { title: "Attendance", singular: "Attendance record", columns: ["date", "student", "className", "status"], fields: [
    { name: "date", label: "Date", type: "date", required: true }, { name: "student", label: "Student", required: true },
    { name: "className", label: "Class" }, { name: "status", label: "Status", type: "select", options: ["Present", "Absent", "Late"] },
  ] },
  fees: { title: "Fees", singular: "Fee record", columns: ["student", "amount", "dueDate", "status"], fields: [
    { name: "student", label: "Student", required: true }, { name: "amount", label: "Amount", type: "number", required: true },
    { name: "dueDate", label: "Due date", type: "date" }, { name: "status", label: "Status", type: "select", options: ["Paid", "Pending", "Overdue"] },
  ] },
};

const initialData = {
  students: [
    { id: 1, name: "Ava Johnson", grade: "Grade 8", className: "8A", guardian: "Mark Johnson", phone: "555-0101" },
    { id: 2, name: "Noah Smith", grade: "Grade 7", className: "7B", guardian: "Lisa Smith", phone: "555-0102" },
  ],
  teachers: [
    { id: 3, name: "Emma Wilson", subject: "Mathematics", phone: "555-0201", email: "emma@school.edu" },
    { id: 4, name: "James Brown", subject: "Science", phone: "555-0202", email: "james@school.edu" },
  ],
  classes: [
    { id: 5, name: "8A", teacher: "Emma Wilson", room: "204", students: "24" },
    { id: 6, name: "7B", teacher: "James Brown", room: "106", students: "22" },
  ],
  attendance: [
    { id: 7, date: new Date().toISOString().slice(0, 10), student: "Ava Johnson", className: "8A", status: "Present" },
    { id: 8, date: new Date().toISOString().slice(0, 10), student: "Noah Smith", className: "7B", status: "Late" },
  ],
  fees: [
    { id: 9, student: "Ava Johnson", amount: "250", dueDate: "2026-11-30", status: "Paid" },
    { id: 10, student: "Noah Smith", amount: "250", dueDate: "2026-11-30", status: "Pending" },
  ],
};

function loadData() {
  try {
    const saved = localStorage.getItem("school-management-data");
    return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
  } catch {
    return initialData;
  }
}

const icons = { dashboard: "▦", students: "♙", teachers: "♧", classes: "▤", attendance: "✓", fees: "$" };
const label = (value) => value.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

export default function App() {
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const section = sections[page];

  useEffect(() => localStorage.setItem("school-management-data", JSON.stringify(data)), [data]);

  function navigate(next) {
    setPage(next);
    setSearch("");
  }

  function openForm() {
    const defaults = {};
    section.fields.forEach((field) => {
      if (field.type === "select") defaults[field.name] = field.options[0];
      if (field.type === "date") defaults[field.name] = new Date().toISOString().slice(0, 10);
    });
    setForm(defaults);
    setModal(true);
  }

  function saveRecord(event) {
    event.preventDefault();
    setData((current) => ({ ...current, [page]: [{ ...form, id: Date.now() }, ...current[page]] }));
    setModal(false);
  }

  function removeRecord(id) {
    if (!window.confirm("Delete this record?")) return;
    setData((current) => ({ ...current, [page]: current[page].filter((record) => record.id !== id) }));
  }

  const filtered = section ? data[page].filter((record) =>
    Object.values(record).some((value) => String(value).toLowerCase().includes(search.toLowerCase())),
  ) : [];
  const stats = {
    students: data.students.length,
    teachers: data.teachers.length,
    present: data.attendance.filter((item) => item.date === new Date().toISOString().slice(0, 10) && item.status === "Present").length,
    pending: data.fees.filter((item) => item.status !== "Paid").length,
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon">S</div><div><strong>SchoolHub</strong><span>Management portal</span></div></div>
      <div className="nav-label">MENU</div>
      <nav>
        {["dashboard", ...Object.keys(sections)].map((key) => <button key={key} className={`nav-item ${page === key ? "active" : ""}`} onClick={() => navigate(key)}>
          <span>{icons[key]}</span>{key === "dashboard" ? "Dashboard" : sections[key].title}
        </button>)}
      </nav>
      <div className="sidebar-bottom"><div className="avatar">AD</div><div><strong>Admin User</strong><span>Administrator</span></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div><span className="eyebrow">SCHOOL ADMINISTRATION</span><h1>{section?.title || "Dashboard"}</h1></div>
        <div className="topbar-right"><span className="today">{new Date().toLocaleDateString()}</span><div className="avatar small">AD</div></div>
      </header>

      {page === "dashboard" ? <Dashboard data={data} stats={stats} onNavigate={navigate} /> : <section className="content-card">
        <div className="section-heading"><div><h2>All {section.title.toLowerCase()}</h2><p>View and manage your school {section.title.toLowerCase()}.</p></div>
          <button className="primary-button" onClick={openForm}><span>＋</span> Add {section.singular}</button></div>
        <div className="table-tools"><input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${section.title.toLowerCase()}...`} />
          <span className="record-count">{filtered.length} record{filtered.length === 1 ? "" : "s"}</span></div>
        <div className="table-wrap"><table><thead><tr>{section.columns.map((column) => <th key={column}>{label(column)}</th>)}<th className="actions-heading">Actions</th></tr></thead>
          <tbody>{filtered.map((record) => <tr key={record.id}>{section.columns.map((column) => <td key={column}>
            {column === "status" ? <span className={`status status-${String(record[column]).toLowerCase()}`}>{record[column]}</span> : column === "amount" ? `$${record[column]}` : record[column] || "—"}
          </td>)}<td className="actions-cell"><button className="delete-button" onClick={() => removeRecord(record.id)}>Delete</button></td></tr>)}
            {filtered.length === 0 && <tr><td className="empty-state" colSpan={section.columns.length + 1}>No records found. Add a record to get started.</td></tr>}
          </tbody></table></div>
      </section>}
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={() => setModal(false)}><div className="modal" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal-heading"><div><span className="eyebrow">NEW RECORD</span><h2>Add {section.singular}</h2></div><button className="close-button" onClick={() => setModal(false)} aria-label="Close">×</button></div>
      <form onSubmit={saveRecord}><div className="form-grid">{section.fields.map((field) => <label className="form-field" key={field.name}><span>{field.label}{field.required ? " *" : ""}</span>
        {field.type === "select" ? <select required={field.required} value={form[field.name] || ""} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}>{field.options.map((option) => <option key={option}>{option}</option>)}</select> :
          <input type={field.type || "text"} required={field.required} min={field.type === "number" ? "0" : undefined} value={form[field.name] || ""} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} />}
      </label>)}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="primary-button">Save record</button></div></form>
    </div></div>}
  </div>;
}

function Dashboard({ data, stats, onNavigate }) {
  const cards = [
    ["Total students", stats.students, "♙", "blue", "students"],
    ["Total teachers", stats.teachers, "♧", "purple", "teachers"],
    ["Present today", stats.present, "✓", "green", "attendance"],
    ["Fees to follow up", stats.pending, "$", "orange", "fees"],
  ];
  return <>
    <section className="welcome-panel"><div><span className="eyebrow">OVERVIEW</span><h2>Welcome back, Admin</h2><p>Here’s what’s happening at your school today.</p></div><div className="welcome-mark">S</div></section>
    <section className="stats-grid">{cards.map(([title, value, icon, color, page]) => <button className="stat-card" key={title} onClick={() => onNavigate(page)}>
      <div className={`stat-icon ${color}`}>{icon}</div><span>{title}</span><strong>{value}</strong><small>View records →</small>
    </button>)}</section>
    <div className="dashboard-grid"><section className="content-card"><div className="section-heading compact"><div><h2>Recent students</h2><p>Latest student records</p></div><button className="text-button" onClick={() => onNavigate("students")}>View all →</button></div>
      <div className="recent-list">{data.students.slice(0, 5).map((student) => <div className="recent-row" key={student.id}><div className="person-avatar">{student.name.split(" ").map((part) => part[0]).join("")}</div><div className="person-info"><strong>{student.name}</strong><span>{student.grade} · Class {student.className}</span></div><span className="list-arrow">→</span></div>)}{data.students.length === 0 && <p className="empty-copy">No students added yet.</p>}</div>
    </section><section className="content-card quick-actions"><div className="section-heading compact"><div><h2>Quick actions</h2><p>Go to a management area</p></div></div>
      {[["students", "Manage students"], ["attendance", "Review attendance"], ["fees", "Track fee payments"], ["classes", "Manage classes"]].map(([page, text]) => <button className="quick-action" key={page} onClick={() => onNavigate(page)}><span>{text}</span><b>→</b></button>)}
    </section></div>
  </>;
}
