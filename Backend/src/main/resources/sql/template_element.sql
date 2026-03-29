-- Create database
CREATE DATABASE IF NOT EXISTS rfo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rfo_db;

-- template_element table
CREATE TABLE IF NOT EXISTS template_element (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'template element ID',
    name varchar(100) NOT NULL COMMENT 'template element name',
    weighting int NOT NULL COMMENT 'weighting',
    maximum_mark int NOT NULL COMMENT 'maximum mark',
    mark_increments DOUBLE NOT NULL COMMENT 'mark increments'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='template_element table';

-- Insert test data (using INSERT IGNORE to handle duplicates)
INSERT IGNORE INTO template_element (id, name, weighting, maximum_mark, mark_increments) VALUES
    (1, 'Voice, Pace and Confidence', 15, 100, 0.5),
    (2, 'Presentation Structure', 15, 100, 0.5),
    (3, 'Quality of Slides/Visual Aids', 15, 100, 0.5),
    (4, 'Knowledge of the Material', 20, 100, 0.5),
    (5, 'Content', 20, 100, 0.5),
    (6, 'Concluding Remarks', 10, 100, 0.5),
    (7, 'Other Comments', 5, 100, 0.5);
