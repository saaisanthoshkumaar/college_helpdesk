-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    college_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    department TEXT,
    academic_year TEXT,
    status TEXT DEFAULT 'active', -- 'active' or 'deactivated'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Eligible College IDs
CREATE TABLE IF NOT EXISTS eligible_college_ids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    college_id TEXT UNIQUE NOT NULL,
    department TEXT,
    academic_year TEXT,
    is_eligible BOOLEAN DEFAULT 1,
    registered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin', -- 'main_admin' or 'admin'
    status TEXT DEFAULT 'active',
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES admins(id)
);

-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    keywords_json TEXT, -- JSON array of keywords/alternative questions
    published BOOLEAN DEFAULT 1,
    created_by INTEGER,
    updated_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES admins(id),
    FOREIGN KEY(updated_by) REFERENCES admins(id)
);

-- College Information
CREATE TABLE IF NOT EXISTS college_information (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    department TEXT,
    source_reference TEXT,
    published BOOLEAN DEFAULT 1,
    created_by INTEGER,
    updated_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES admins(id),
    FOREIGN KEY(updated_by) REFERENCES admins(id)
);

-- Notices
CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    department TEXT,
    published BOOLEAN DEFAULT 1,
    valid_from DATETIME,
    valid_until DATETIME,
    created_by INTEGER,
    updated_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES admins(id),
    FOREIGN KEY(updated_by) REFERENCES admins(id)
);

-- Chat History
CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER, -- NULL for public preview
    session_reference TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    matched_faq_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(matched_faq_id) REFERENCES faqs(id)
);

-- Admin Activity Log
CREATE TABLE IF NOT EXISTS admin_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    metadata TEXT, -- JSON string for safe metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(admin_id) REFERENCES admins(id)
);
