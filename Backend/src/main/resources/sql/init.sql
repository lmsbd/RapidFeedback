Drop Database IF EXISTS rfo_db;
-- Create database
CREATE DATABASE IF NOT EXISTS rfo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rfo_db;

-- ============================================
-- User table
-- ============================================
CREATE TABLE IF NOT EXISTS user
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'User ID',
    username      VARCHAR(32)  NOT NULL COMMENT 'User name',
    password      VARCHAR(255) NOT NULL COMMENT 'User password',
    email         VARCHAR(100) NOT NULL COMMENT 'User email',
    role          TINYINT      NOT NULL COMMENT 'User role: 1 is admin, 2 is marker',
    delete_status TINYINT DEFAULT 0 COMMENT 'Delete status: 1 is deleted, 0 is not deleted',
    avatar        VARCHAR(255)     DEFAULT NULL COMMENT 'User avatar URL'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='User table';

-- Insert initial users
-- Default passwords: admin=admin123, marker1-5=marker123
INSERT IGNORE INTO user (username, password, email, role)
VALUES ('admin', '$2a$10$aET9KZ4RTEmAxYIt41PIguYSYGN80610oTUof/mISIXt38VLEgkya', 'admin@example.com', 1),
       ('marker1', '$2a$10$CbHYLHnou0.pJDawc.lqOO.30swJ3F3UUI48X9YWHwt7lba3KIgcG', 'marker1@example.com', 2),
       ('marker2', '$2a$10$WPnlJxpT7UWUc5aAgOJiKuFxmgpINO44V0GcVB4/BVXqrFVXXXjue', 'marker2@example.com', 2),
       ('marker3', '$2a$10$WPnlJxpT7UWUc5aAgOJiKuFxmgpINO44V0GcVB4/BVXqrFVXXXjue', 'marker3@example.com', 2),
       ('marker4', '$2a$10$WPnlJxpT7UWUc5aAgOJiKuFxmgpINO44V0GcVB4/BVXqrFVXXXjue', 'marker4@example.com', 2),
       ('marker5', '$2a$10$WPnlJxpT7UWUc5aAgOJiKuFxmgpINO44V0GcVB4/BVXqrFVXXXjue', 'marker5@example.com', 2);

-- ============================================
-- Student table
-- ============================================
CREATE TABLE IF NOT EXISTS student
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    student_id    BIGINT       NOT NULL COMMENT 'Student ID',
    email         VARCHAR(100) NOT NULL COMMENT 'Student email',
    first_name    VARCHAR(100) NOT NULL COMMENT 'Student first name',
    surname       VARCHAR(100) NOT NULL COMMENT 'Student last name',
    delete_status TINYINT DEFAULT 0 COMMENT 'Delete status: 1 is deleted, 0 is not deleted'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='Student table';

-- Insert test data for student
INSERT IGNORE INTO student (student_id, email, first_name, surname)
VALUES (1510000, 'alice.chen@student.unimelb.edu.au', 'Alice', 'Chen'),
       (1510001, 'bob.smith@student.unimelb.edu.au', 'Bob', 'Smith'),
       (1510002, 'charlie.wang@student.unimelb.edu.au', 'Charlie', 'Wang'),
       (1510003, 'diana.lee@student.unimelb.edu.au', 'Diana', 'Lee'),
       (1510004, 'emma.brown@student.unimelb.edu.au', 'Emma', 'Brown'),
       (1510005, 'frank.zhang@student.unimelb.edu.au', 'Frank', 'Zhang'),
       (1510006, 'grace.wilson@student.unimelb.edu.au', 'Grace', 'Wilson'),
       (1510007, 'henry.liu@student.unimelb.edu.au', 'Henry', 'Liu'),
       (1510008, 'iris.johnson@student.unimelb.edu.au', 'Iris', 'Johnson'),
       (1510009, 'jack.yang@student.unimelb.edu.au', 'Jack', 'Yang');

-- ============================================
-- Subject table
-- ============================================
CREATE TABLE IF NOT EXISTS subject
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Subject ID',
    name          VARCHAR(100) NOT NULL COMMENT 'Subject name',
    description   VARCHAR(500) COMMENT 'Subject description',
    delete_status TINYINT DEFAULT 0 COMMENT 'Delete status: 1 is deleted, 0 is not deleted'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='Subject table';

-- Insert test data
INSERT IGNORE INTO subject (name, description)
VALUES ('Mathematics', 'Advanced mathematics and calculus'),
       ('Physics', 'Classical and modern physics'),
       ('Chemistry', 'Organic and inorganic chemistry'),
       ('Biology', 'Cell biology and genetics'),
       ('Computer Science', 'Programming and algorithms');

-- ============================================
-- Template table
-- ============================================
CREATE TABLE IF NOT EXISTS template
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Template ID',
    template_name VARCHAR(100) NOT NULL COMMENT 'Template name',
    creator_id    BIGINT COMMENT 'creator ID create the template',
    delete_status TINYINT DEFAULT 0 COMMENT 'Delete status: 1 is deleted, 0 is not deleted'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='template table';

-- Insert test data for template
INSERT IGNORE INTO template (template_name, creator_id)
VALUES ('Presentation Assessment Template', 1),
       ('Lab Report Template', 1),
       ('Project Proposal Template', 2);

-- ============================================
-- Template element table
-- ============================================
CREATE TABLE IF NOT EXISTS template_element
(
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Template element ID',
    name            VARCHAR(100) NOT NULL COMMENT 'Template element name',
    weighting       INT          NOT NULL COMMENT 'Weighting',
    maximum_mark    INT          NOT NULL COMMENT 'Maximum mark',
    mark_increments DOUBLE       NOT NULL COMMENT 'Mark increments',
    delete_status   TINYINT DEFAULT 0 COMMENT 'Delete status: 1 is deleted, 0 is not deleted'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='Template element table';

-- Insert test data (using INSERT IGNORE to handle duplicates)
INSERT IGNORE INTO template_element (id, name, weighting, maximum_mark, mark_increments) VALUES
    (1, 'Voice, Pace and Confidence', 15, 100, 0.5),
    (2, 'Presentation Structure', 15, 100, 0.5),
    (3, 'Quality of Slides/Visual Aids', 15, 100, 0.5),
    (4, 'Knowledge of the Material', 20, 100, 0.5),
    (5, 'Content', 20, 100, 0.5),
    (6, 'Concluding Remarks', 10, 100, 0.5),
    (7, 'Other Comments', 5, 100, 0.5);

-- ============================================
-- Comment library table
-- ============================================
CREATE TABLE IF NOT EXISTS comment_library
(
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'comment ID',
    template_element_id BIGINT       NOT NULL COMMENT 'Linked template element ID',
    content             VARCHAR(100) NOT NULL COMMENT 'content',
    comment_type        INT COMMENT 'comment type',
    delete_status       TINYINT DEFAULT 0 COMMENT 'Delete status: 1 is deleted, 0 is not deleted'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='comment table';

-- Insert test data for comment library
-- Comment types: 0=negative, 1=neutral, 2=positive
INSERT IGNORE INTO comment_library (template_element_id, content, comment_type)
VALUES
    -- Voice, Pace and Confidence (template_element_id=1)
    (1, 'Excellent vocal clarity and confident delivery throughout.', 2),
    (1, 'Good pacing, allowing audience to absorb information.', 2),
    (1, 'Speaking too quickly, hard to follow at times.', 0),
    (1, 'Low voice volume, difficult to hear in the back.', 0),
    (1, 'Consider varying your pace for emphasis.', 1),
    -- Presentation Structure (template_element_id=2)
    (2, 'Well-organized with clear introduction and conclusion.', 2),
    (2, 'Logical flow between sections, easy to follow.', 2),
    (2, 'Lacks clear structure, transitions are abrupt.', 0),
    (2, 'Missing introduction or conclusion.', 0),
    (2, 'Consider adding transition slides between sections.', 1),
    -- Quality of Slides/Visual Aids (template_element_id=3)
    (3, 'Professional slides with clear, readable fonts.', 2),
    (3, 'Effective use of diagrams and visual elements.', 2),
    (3, 'Too much text on slides, overwhelming.', 0),
    (3, 'Poor color contrast, hard to read.', 0),
    (3, 'Consider using more visual aids to support points.', 1),
    -- Knowledge of the Material (template_element_id=4)
    (4, 'Demonstrates deep understanding of the topic.', 2),
    (4, 'Confidently answered all questions from audience.', 2),
    (4, 'Struggled with basic concepts, needs more preparation.', 0),
    (4, 'Unable to answer clarification questions.', 0),
    (4, 'Review core concepts before next presentation.', 1),
    -- Content (template_element_id=5)
    (5, 'Comprehensive coverage of all required topics.', 2),
    (5, 'Excellent use of examples and case studies.', 2),
    (5, 'Content is too shallow, lacks depth.', 0),
    (5, 'Missing key components of the assignment.', 0),
    (5, 'Consider adding more real-world examples.', 1),
    -- Concluding Remarks (template_element_id=6)
    (6, 'Strong conclusion that summarizes key points well.', 2),
    (6, 'Memorable closing statement.', 2),
    (6, 'Conclusion is rushed and incomplete.', 0),
    (6, 'No clear takeaway message.', 0),
    (6, 'Strengthen conclusion with call-to-action.', 1),
    -- Other Comments (template_element_id=7)
    (7, 'Overall excellent presentation.', 2),
    (7, 'Good effort, shows improvement from last time.', 2),
    (7, 'Needs significant improvement in multiple areas.', 0),
    (7, 'Practice more before next presentation.', 1);

-- ============================================
-- Assessment criteria table
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_criteria
(
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Assessment criteria ID',
    template_id         BIGINT NOT NULL COMMENT 'Linked template ID',
    template_element_id BIGINT NOT NULL COMMENT 'Linked template element ID',
    template_element_name VARCHAR(100) COMMENT 'Template element name',
    weighting           INT    NOT NULL COMMENT 'Weighting',
    maximum_mark        INT    NOT NULL COMMENT 'Maximum mark',
    mark_increments     DOUBLE NOT NULL COMMENT 'Mark increments',
    delete_status       TINYINT DEFAULT 0 COMMENT 'Soft delete: 1=deleted, 0=active'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='Assessment criteria table';

-- Insert test data for assessment criteria
-- Template 1: Presentation Assessment Template - complete configuration
INSERT IGNORE INTO assessment_criteria (template_id, template_element_id, template_element_name, weighting, maximum_mark, mark_increments)
VALUES
-- Template 1: Presentation Assessment Template
    (1, 1, 'Voice, Pace and Confidence',   15, 100, 0.5),
    (1, 2, 'Presentation Structure',        15, 100, 0.5),
    (1, 3, 'Quality of Slides/Visual Aids', 15, 100, 0.5),
    (1, 4, 'Knowledge of the Material',     20, 100, 0.5),
    (1, 5, 'Content',                        20, 100, 0.5),
    (1, 6, 'Concluding Remarks',            10, 100, 0.5),
    (1, 7, 'Other Comments',                 5, 100, 0.5),
-- Template 2: Lab Report Template
    (2, 2, 'Presentation Structure',    25, 100, 1.0),
    (2, 4, 'Knowledge of the Material', 30, 100, 1.0),
    (2, 5, 'Content',                   35, 100, 1.0),
    (2, 7, 'Other Comments',            10, 100, 1.0),
-- Template 3: Project Proposal Template
    (3, 2, 'Presentation Structure',    25, 100, 1.0),
    (3, 4, 'Knowledge of the Material', 30, 100, 1.0),
    (3, 5, 'Content',                   35, 100, 1.0),
    (3, 6, 'Concluding Remarks',        10, 100, 1.0);

-- ============================================
-- Project table
-- ============================================
CREATE TABLE IF NOT EXISTS project
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Project ID',
    project_name  VARCHAR(100) NOT NULL COMMENT 'Project name',
    countdown     BIGINT COMMENT 'Countdown time for the project presentation',
    subject_id    BIGINT       NOT NULL COMMENT 'Subject ID associated with the project',
    template_id   BIGINT COMMENT 'template_id',
    project_type  VARCHAR(20)  NOT NULL DEFAULT 'individual' COMMENT 'Project type: individual or group',
    delete_status TINYINT DEFAULT 0 COMMENT 'Delete status: 1 is deleted, 0 is not deleted'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='Project table';

-- Insert test data for project
INSERT IGNORE INTO project (project_name, countdown, subject_id, template_id)
VALUES ('Calculus Project', 1200000, 1, 1),
       ('Linear Algebra Presentation', 1500000, 1, 1),
       ('Physics Lab Experiment', 900000, 2, 2),
       ('Quantum Mechanics Study', 1200000, 2, 1),
       ('Chemistry Research', 1500000, 3, 3),
       ('Organic Chemistry Synthesis', 1800000, 3, 2),
       ('Biology Experiment', 1800000, 4, 1),
       ('Genetics Research Project', 2000000, 4, 3),
       ('Software Engineering Project', 1500000, 5, 1),
       ('Machine Learning Application', 2000000, 5, 1);

-- ============================================
-- Group table
-- ============================================
CREATE TABLE IF NOT EXISTS project_group
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Group ID',
    group_name    VARCHAR(100) NOT NULL COMMENT 'Group name',
    project_id    BIGINT       NOT NULL COMMENT 'project_id',
    delete_status TINYINT DEFAULT 0 COMMENT 'Delete status: 1 is deleted, 0 is not deleted'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='Group table';

-- Insert test data for project_group
INSERT IGNORE INTO project_group (group_name, project_id)
VALUES ('Group A', 1),
       ('Group B', 1),
       ('Team Alpha', 2),
       ('Team Beta', 2),
       ('Lab Group 1', 3),
       ('Lab Group 2', 3),
       ('Lab Group 3', 3),
       ('QM Team 1', 4),
       ('QM Team 2', 4),
       ('Chem Group A', 5),
       ('Chem Group B', 5),
       ('Synthesis Team', 6),
       ('Bio Team 1', 7),
       ('Bio Team 2', 7),
       ('Genetics Group', 8),
       ('SE Team Alpha', 9),
       ('SE Team Beta', 9),
       ('SE Team Gamma', 9),
       ('ML Team 1', 10),
       ('ML Team 2', 10);

-- ============================================
-- Group-student association table
-- ============================================
CREATE TABLE IF NOT EXISTS group_student
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Table ID',
    student_id    BIGINT COMMENT 'Student ID',
    group_id      BIGINT COMMENT 'group ID',
    delete_status TINYINT DEFAULT 0 COMMENT 'Delete status: 1 is deleted, 0 is not deleted'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='group-student association table';

-- Insert test data for group-student associations
-- student_id references student.id (PK), not the business student_id number
INSERT IGNORE INTO group_student (student_id, group_id)
VALUES
    -- Calculus Project groups: Alice(id=1), Charlie(id=3) in Group A; Bob(id=2), Diana(id=4) in Group B
    (1, 1), (3, 1),
    (2, 2), (4, 2),
    -- Linear Algebra groups: Emma(id=5), Frank(id=6) in Team Alpha; Grace(id=7), Henry(id=8) in Team Beta
    (5, 3), (6, 3),
    (7, 4), (8, 4),
    -- Physics Lab groups: Alice(id=1) in Lab1, Bob(id=2) in Lab2, Charlie(id=3) in Lab3
    (1, 5), (2, 6), (3, 7),
    -- QM groups: Diana(id=4) in QM Team1, Emma(id=5) in QM Team2
    (4, 8), (5, 9),
    -- Chemistry groups: Frank(id=6) in ChemA, Grace(id=7) in ChemB, Henry(id=8) in Synthesis
    (6, 10), (7, 11), (8, 12),
    -- Biology groups: Alice(id=1) in Bio1, Bob(id=2) in Bio2, Charlie(id=3) in Genetics
    (1, 13), (2, 14), (3, 15),
    -- Computer Science groups: Iris(id=9) in SE Alpha, Jack(id=10) in SE Beta, Frank(id=6) in SE Gamma
    (9, 16), (10, 17), (6, 18),
    -- ML groups: Grace(id=7) in ML Team1, Henry(id=8) in ML Team2
    (7, 19), (8, 20);

-- ============================================
-- Student-project association table
-- ============================================
CREATE TABLE IF NOT EXISTS student_project
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    student_id BIGINT COMMENT 'Student ID',
    subject_id BIGINT COMMENT 'Subject ID',
    project_id BIGINT COMMENT 'Project ID'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='Student-project association table';

-- Insert test data for student-project association
-- student_id references student.id (PK), not the business student_id number
INSERT IGNORE INTO student_project (student_id, subject_id, project_id)
VALUES
    -- Mathematics projects: Alice(1), Charlie(3) → Calculus(1); Bob(2), Diana(4), Emma(5), Grace(7) → LinearAlgebra(2)
    (1, 1, 1), (3, 1, 1), (2, 1, 2), (4, 1, 2),
    (5, 1, 2), (6, 1, 1), (7, 1, 2), (8, 1, 1),
    -- Physics projects: Alice(1), Bob(2), Charlie(3) → PhysicsLab(3); Diana(4), Emma(5) → QM(4)
    (1, 2, 3), (2, 2, 3), (3, 2, 3), (4, 2, 4), (5, 2, 4),
    -- Chemistry projects: Frank(6), Grace(7) → ChemResearch(5); Henry(8) → OrganicSynthesis(6)
    (6, 3, 5), (7, 3, 5), (8, 3, 6),
    -- Biology projects: Alice(1), Bob(2) → BioExperiment(7); Charlie(3) → GeneticsResearch(8)
    (1, 4, 7), (2, 4, 7), (3, 4, 8),
    -- Computer Science projects: Iris(9), Jack(10), Henry(8) → SEProject(9); Frank(6), Grace(7) → MLApplication(10)
    (9, 5, 9), (10, 5, 9), (6, 5, 10), (7, 5, 10), (8, 5, 9);

-- ============================================
-- Student-Subject association table
-- ============================================
CREATE TABLE IF NOT EXISTS student_subject
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    student_id BIGINT COMMENT 'Student ID',
    subject_id BIGINT COMMENT 'Subject ID'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='Student-Subject association table';

-- Insert test data for student-subject association
-- student_id references student.id (PK), not the business student_id number
INSERT IGNORE INTO student_subject (student_id, subject_id)
VALUES
    -- Alice(id=1): Mathematics, Physics, Biology
    (1, 1), (1, 2), (1, 4),
    -- Bob(id=2): Mathematics, Physics, Biology
    (2, 1), (2, 2), (2, 4),
    -- Charlie(id=3): Mathematics, Physics
    (3, 1), (3, 2),
    -- Diana(id=4): Mathematics, Physics
    (4, 1), (4, 2),
    -- Emma(id=5): Mathematics, Physics
    (5, 1), (5, 2),
    -- Frank(id=6): Mathematics, Chemistry, Computer Science
    (6, 1), (6, 3), (6, 5),
    -- Grace(id=7): Mathematics, Chemistry, Computer Science
    (7, 1), (7, 3), (7, 5),
    -- Henry(id=8): Mathematics, Chemistry, Computer Science
    (8, 1), (8, 3), (8, 5),
    -- Iris(id=9): Computer Science
    (9, 5),
    -- Jack(id=10): Computer Science
    (10, 5);

-- ============================================
-- User-project association table
-- ============================================
CREATE TABLE IF NOT EXISTS user_project
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id    BIGINT COMMENT 'User ID',
    subject_id BIGINT COMMENT 'Subject ID',
    project_id BIGINT COMMENT 'Project ID'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='User-project association table';

-- Insert test data for user-project association
INSERT IGNORE INTO user_project (user_id, subject_id, project_id)
VALUES
    -- Admin oversees all projects
    (1, 1, 1), (1, 1, 2), (1, 2, 3), (1, 2, 4), (1, 3, 5),
    (1, 3, 6), (1, 4, 7), (1, 4, 8), (1, 5, 9), (1, 5, 10),
    -- Marker1: Mathematics and Physics
    (2, 1, 1), (2, 1, 2), (2, 2, 3), (2, 2, 4),
    -- Marker2: Chemistry and Biology
    (3, 3, 5), (3, 3, 6), (3, 4, 7), (3, 4, 8),
    -- Marker3: Computer Science
    (4, 5, 9), (4, 5, 10),
    -- Marker4: Mathematics and Computer Science
    (5, 1, 1), (5, 1, 2), (5, 5, 9),
    -- Marker5: Physics and Chemistry
    (6, 2, 3), (6, 2, 4), (6, 3, 5);

-- ============================================
-- User-Subject association table
-- ============================================
CREATE TABLE IF NOT EXISTS user_subject
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    user_id    BIGINT COMMENT 'User ID',
    subject_id BIGINT COMMENT 'Subject ID'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='User-Subject association table';

-- Insert test data for user-subject association
INSERT IGNORE INTO user_subject (user_id, subject_id)
VALUES
    -- Admin: all subjects
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
    -- Marker1: Mathematics, Physics
    (2, 1), (2, 2),
    -- Marker2: Chemistry, Biology
    (3, 3), (3, 4),
    -- Marker3: Computer Science
    (4, 5),
    -- Marker4: Mathematics, Computer Science
    (5, 1), (5, 5),
    -- Marker5: Physics, Chemistry
    (6, 2), (6, 3);


-- ============================================
-- Mark record table
-- ============================================
CREATE TABLE IF NOT EXISTS mark_record
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mark record ID',
    project_id  BIGINT       NOT NULL COMMENT 'Linked project ID',
    student_id  BIGINT       NOT NULL COMMENT 'Student primary key (references student.id)',
    marker_id   BIGINT       NOT NULL COMMENT 'Linked user ID (marker)',
    total_score DECIMAL(6,2) COMMENT 'Weighted total score, calculated on submission',
    group_score DECIMAL(6,2) COMMENT 'Group score from group_mark_record, nullable',
    mark_time   DATETIME     COMMENT 'Submission timestamp',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci COMMENT = 'Mark record table';

  -- ============================================
  -- Mark detail table
  -- ============================================
CREATE TABLE IF NOT EXISTS mark_detail
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mark detail ID',
    mark_record_id BIGINT       NOT NULL COMMENT 'Linked mark_record ID',
    criteria_id    BIGINT       NOT NULL COMMENT 'Linked assessment_criteria ID',
    score          DECIMAL(6,2) COMMENT 'Score for this criteria',
    comment        TEXT         COMMENT 'Comment for this criteria',
    status         TINYINT      NOT NULL DEFAULT 0 COMMENT '0=first mark, 1=changed',
    create_time    DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_record_criteria (mark_record_id, criteria_id)
) ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci COMMENT = 'Mark detail table';

-- Insert test data for mark_record
-- project 9 (Software Engineering Project, template_id=1): Iris(id=9), Jack(id=10), Henry(id=8)
-- marker3=user_id=4, marker4=user_id=5
INSERT IGNORE INTO mark_record (id, project_id, student_id, marker_id, total_score, mark_time)
VALUES
    (1, 9, 9, 4, 76.75, '2025-10-01 10:00:00'),  -- Iris, submitted
    (2, 9, 10, 4, NULL,  NULL);                    -- Jack, saved (Henry has no record = unmarked)

-- Insert test data for mark_detail (for mark_record id=1, template_id=1, criteria id=1~7)
-- total_score = 80*15% + 75*15% + 90*15% + 70*20% + 75*20% + 80*10% + 60*5% = 76.75
INSERT IGNORE INTO mark_detail (mark_record_id, criteria_id, score, comment, status)
VALUES
    (1, 1, 80.0, 'Good vocal delivery', 1),   -- Voice, Pace and Confidence
    (1, 2, 75.0, '', 1),                       -- Presentation Structure
    (1, 3, 90.0, 'Clear slides', 1),           -- Quality of Slides/Visual Aids
    (1, 4, 70.0, '', 1),                       -- Knowledge of the Material
    (1, 5, 75.0, '', 1),                       -- Content
    (1, 6, 80.0, '', 1),                       -- Concluding Remarks
    (1, 7, 60.0, '', 1);                       -- Other Comments


-- ============================================
-- Group mark record table
-- ============================================
CREATE TABLE IF NOT EXISTS group_mark_record
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Group mark record ID',
    project_id  BIGINT       NOT NULL COMMENT 'Linked project ID',
    group_id    BIGINT       NOT NULL COMMENT 'Linked project_group ID',
    comment     TEXT         COMMENT 'Overall comment for the whole group from the marker',
    mark_time   DATETIME     COMMENT 'Last updated timestamp',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_project_group (project_id, group_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Group mark record table';

-- Insert test data for group_mark_record
-- project 9 (Software Engineering Project): SE Team Alpha (group_id=16)
INSERT IGNORE INTO group_mark_record (id, project_id, group_id, comment, mark_time)
VALUES
    (1, 9, 16, 'Good team collaboration overall.', '2025-10-01 10:00:00');  -- SE Team Alpha

-- ============================================
-- Marker-student assignment table (per-student marker for individual projects)
-- ============================================
CREATE TABLE IF NOT EXISTS marker_student
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    project_id BIGINT NOT NULL COMMENT 'Linked project ID',
    student_id BIGINT NOT NULL COMMENT 'student.id (primary key)',
    marker_id  BIGINT NOT NULL COMMENT 'user.id of the assigned marker'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Marker-student assignment table';

-- ============================================
-- Marker-group assignment table (per-group marker for group projects)
-- ============================================
CREATE TABLE IF NOT EXISTS marker_group
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    project_id BIGINT NOT NULL COMMENT 'Linked project ID',
    group_id   BIGINT NOT NULL COMMENT 'project_group.id',
    marker_id  BIGINT NOT NULL COMMENT 'user.id of the assigned marker'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Marker-group assignment table';
