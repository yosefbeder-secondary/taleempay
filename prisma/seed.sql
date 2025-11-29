-- Create Book
INSERT INTO "Book" ("id", "name", "price", "isActive", "classId") VALUES ('book-1', 'Pathology 101', 250.0, 1, 1);

-- Create Students Class 1
INSERT INTO "Student" ("id", "name", "settingId", "classId") VALUES ('s-1', 'Mohamed Ahmed', '2026001', 1);
INSERT INTO "Student" ("id", "name", "settingId", "classId") VALUES ('s-2', 'Ali Hassan', '2026002', 1);
INSERT INTO "Student" ("id", "name", "settingId", "classId") VALUES ('s-3', 'Sarah Mahmoud', '2026003', 1);

-- Create Students Class 2
INSERT INTO "Student" ("id", "name", "settingId", "classId") VALUES ('s-4', 'Yosef Beder', '2026301', 2);
INSERT INTO "Student" ("id", "name", "settingId", "classId") VALUES ('s-5', 'Nour Ali', '2026302', 2);
