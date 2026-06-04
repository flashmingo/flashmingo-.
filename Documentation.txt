# Kenmei

## Project Description
An all-in-one comprehensive learning and studying website similar to Quizlet and Anki. The most important features include: flippable flashcards that can be created and edited with text and pictures that also use a specific algorithm based on principles of active recall in neuroscience to have the best memory growth; being able to turn these flashcard decks into fun memory games that can be played solo or offline with friends by using a scoring metric to compare with frioends as a competitve aspect to promote learning (leaderbord gameification); AI created study guides and practice tests based on flashcard sets; and the more time spent studying results in more coins, coins that are accumulated over time can show how hard someone is working or studying. Additionally, this website is supposed to be extremely secure in compliance with the Ohio Senate Bill 29, not to access, store, or use any data that is private. Additionally, there should be teacher accounts that can add kids to a classroom by using a classroom code to track studying. Finally, there should be a third type of account, an administrator account with no features as of now, but it should have executive access to teacher and student accounts. All students and teachers should be affiliated with a district, and they will have an option to join the district with administrator approval.

## Product Requirements Document
1. Introduction

1.1 Purpose
The purpose of this Product Requirements Document (PRD) is to outline the detailed requirements, goals, features, and specifications for "Kenmei," an all-in-one comprehensive learning and studying website. This document will serve as a guide for the development team, ensuring that the final product aligns with the project's vision, business objectives, and strict security and compliance mandates, particularly Ohio Senate Bill 29.

1.2 Scope
This PRD covers the initial Minimum Viable Product (MVP) for Kenmei, intended for a pilot program within the next two weeks. It details core functionalities including flashcard creation and management, an advanced active recall algorithm, AI-powered study tools, gamified learning experiences, and robust security measures tailored for the K-12 educational sector. It also defines user roles, technical architecture, performance targets, and compliance requirements.

1.3 Vision
Kenmei aims to be the leading secure and effective digital learning platform for K-12 students, teachers, and districts. By integrating neuroscience-backed active recall, engaging gamification, and intelligent AI assistance, Kenmei will foster superior memory growth, enhance learning outcomes, and provide educators with valuable insights into student progress, all while upholding the highest standards of data privacy and security.

2. Goals and Objectives

2.1 Business Goals
- Achieve high district adoption rates, starting with K-12 districts.
- Maximize educational impact by improving student memory growth and academic performance.
- Establish Kenmei as a trusted, secure, and compliant learning platform in the education technology market.

2.2 Product Goals
- Deliver a highly intuitive and user-friendly platform for creating, managing, and studying flashcards.
- Implement a robust active recall algorithm that dynamically adapts to student performance for optimized learning.
- Provide AI-driven tools that effectively generate personalized study materials (guides, practice tests, interactive questions) based on user-created content.
- Integrate engaging gamification mechanics that motivate students and promote active learning, with competitive leaderboards.
- Ensure strict compliance with Ohio Senate Bill 29 regarding student data privacy and security.
- Enable teachers to effectively manage classrooms, track student study progress, and facilitate learning activities.
- Provide district administrators with high-level oversight and management capabilities.
- Ensure the platform is performant and scalable to support a rapidly growing user base.

2.3 Non-Goals
- Development or implementation of a coin-based reward system (this feature has been removed).
- Monetization features beyond district adoption models for the initial MVP.
- Accessing, storing, or using any Personally Identifiable Information (PII) or prohibited student education records beyond what is strictly necessary for secure account management and district-approved functions.

3. User Roles and Personas
Kenmei supports three distinct user roles, each with specific permissions and functionalities, all governed by stringent security and privacy protocols.

3.1 Student User
Students are the primary users of the learning features.
- **Capabilities:** Create, edit, and manage personal flashcard decks; engage in study sessions using the active recall algorithm; play memory games; utilize AI study guides, practice tests, and interactive questions; view personal study progress; opt-in/out of leaderboard visibility. Students must be affiliated with a district and can be added by a teacher using a classroom code or directly by a district administrator.
- **Data Access:** Can only access their own flashcards, study data, and content shared within their classroom/district. No access to other students' PII or detailed study data (beyond aggregated, anonymized leaderboard rankings if opted-in). Teacher-viewable study time is accessible only to their teacher.

3.2 Teacher User
Teachers manage classrooms and oversee student learning.
- **Capabilities:** Create and manage classrooms using unique classroom codes; add students to classrooms; track students' time spent studying within their classroom; create and share flashcard decks and study materials with their students; manage and customize AI-generated content settings (e.g., difficulty, length); view classroom-level leaderboards. Teachers are affiliated with a district.
- **Data Access:** Can view study time data for students within their assigned classrooms. Cannot access individual student PII (other than username/classroom membership) or private study details. Cannot access data from other classrooms or districts. All actions are auditable.

3.3 Administrator User
Administrators have executive oversight at the district level.
- **Capabilities:** Approve district affiliation requests for teachers and students; executive access to teacher and student accounts (e.g., manage user accounts, assign roles within the district); view district-level leaderboards; oversee district-wide settings and compliance. No specific features defined for the initial MVP beyond executive access and approval flows.
- **Data Access:** Elevated access to manage user accounts within their affiliated district. All administrator actions are subject to comprehensive auditing and logging. Cannot access student PII prohibited by Ohio SB 29. All data accessed is encrypted and strictly controlled by role-based access.

4. Features and Functionality

4.1 Account Management & Onboarding
- **Student Account Creation:** Students can register and join a district, requiring administrator approval. They can also be added to a classroom by a teacher using a classroom code.
- **Teacher Account Creation:** Teachers can register and join a district, requiring administrator approval.
- **Administrator Account Creation:** Pre-provisioned or created via a secure, high-privilege process (details TBD).
- **District Affiliation:** All students and teachers must be affiliated with a district, with district administrator approval required for joining.
- **Classroom Code Management:** Teachers can generate and manage unique classroom codes to invite students.

4.2 Flashcard Management & Study
- **Creation & Editing:** Users (students and teachers) can create new flashcard decks and individual flashcards. Each flashcard supports text and image content on both sides (front and back).
- **Active Recall Algorithm (SM-2 Based):**
    - Integrates a modified SM-2 spaced repetition model.
    - Each flashcard maintains an "ease factor" and "review interval."
    - During study sessions, users provide feedback on recall accuracy and confidence (e.g., correct/high confidence, correct/low confidence, incorrect).
    - Correct recall with high confidence increases ease factor and extends review interval.
    - Correct but hesitant recall increases interval modestly.
    - Incorrect recall resets interval to a shorter stage, ensuring sooner re-appearance.
    - The system prioritizes difficult cards for earlier review within a session.
    - Tracks metrics: accuracy, confidence, response time, and streaks.
    - Calculates a "memory growth score" from these metrics.
- **Study Sessions:** Users initiate study sessions where cards are presented based on their review schedule and difficulty, optimizing retention.

4.3 AI Study Assistant
AI integration will be powered by the ChatGPT API, operating via a modular service layer for potential future provider swaps. Personalization is driven by user flashcard sets and SM-2 performance data.
- **AI-Generated Study Guides:**
    - Generates concise study guides (organized summaries, key terms, high-yield concepts) based on selected flashcard sets.
    - Output format: clean text within the app, optional downloadable PDF.
    - Follows privacy/security constraints, respects classroom/district settings, and supports teacher controls.
- **AI-Generated Practice Tests:**
    - Creates full practice tests from flashcard content and related concepts (multiple-choice, short-answer, matching, true/false, timed recall).
    - Auto-graded by AI with answer keys and rationale.
    - Includes distractors aligned to common misconceptions found in flashcards.
    - Instant scoring with per-item feedback and references back to source cards.
    - Can be saved as reusable "question pools."
    - Output format: interactive flows within the app, optional downloadable PDF.
    - Teacher controls for difficulty, length, and standards alignment.
- **AI-Generated Interactive Questions:**
    - Generates dynamic, interactive questions (short-answer, multiple choice, matching, timed recall) based on flashcard content.
    - Provides hints, step-by-step solutions, and explanations within the app.

4.4 Gamification & Engagement
- **Memory Games:** Transforms flashcard decks into engaging activities.
    - **Speed Recall Challenge:** Flashcards appear rapidly; users answer before time runs out for points (accuracy, speed, streaks).
    - **Matching Mode:** Match terms/definitions or images/text from a shuffled grid, with bonus points for speed.
    - **Battle Quiz:** Multiple-choice or true/false questions from flashcards, playable solo or offline with friends. Scores are compared at the end.
- **Scoring System:** Consistent metric across all games.
    - Base points for correct answers.
    - Bonus points for speed.
    - Streak multipliers for consecutive successes.
    - Difficulty weighting (harder cards yield more points).
- **Leaderboards:** Promotes friendly competition.
    - Classroom-level leaderboards.
    - District-level leaderboards.
    - Rankings: weekly, monthly, and all-time.
    - Students have the option to opt out of appearing in rankings.

4.5 Progress Tracking & Reporting
- **Teacher-Viewable Study Time:** Teachers can see the total time their students have spent studying on the platform.
- **Memory Growth Score:** Users can track their personal memory growth score, derived from their active recall performance (accuracy, confidence, response time, streaks).

4.6 Core Platform Features
- **Search & Organization:** Ability to search for and organize flashcard decks.
- **Sharing:** Users can share flashcard sets and AI-generated study guides.

5. User Experience (UX) and Design

5.1 General Principles
Kenmei will prioritize a simplistic, intuitive user experience. The interface should be easy to navigate, minimizing cognitive load and allowing users to focus on learning.

5.2 Visual Aesthetic
The website's design will be inspired by Japanese aesthetics, utilizing colors such as sakura (cherry blossom pinks), to evoke a sense of wisdom, tranquility, and inviting simplicity. The visual style will reinforce the product name "Kenmei," meaning "wisdom" in Japanese.

6. Technical Requirements

6.1 Architecture & Hosting
- **Platform:** Web-based application.
- **Hosting:** Supabase, leveraging its features:
    - Scalable Postgres database for data storage.
    - Integrated authentication services.
    - Real-time APIs for dynamic interactions (e.g., games, leaderboards).
    - Secure storage for user-uploaded images and generated content.
    - Row-level security policies for fine-grained access control.
    - Built-in encryption for data at rest.
    - Edge functions and caching for low latency.
    - Observability and monitoring tools for tracking performance and errors.
- **AI Integration:** ChatGPT API via a modular service layer.

6.2 Scalability & Performance KPIs
- **User Base:** Initial: 30,000 students/teachers (Year 1); Growth: 100,000+ users (Year 3).
- **Concurrent Users:** Provisioned for 3x peak load.
    - Year 1: ~300 concurrent users (1% conservative estimate).
    - Year 3: ~1,000 concurrent users.
- **API Latency (95th percentile):**
    - General APIs: Below 300 milliseconds.
    - Authentication & Flashcard Review Endpoints: Under 150 milliseconds.
    - Real-time Interactions (Games, Leaderboards): Under 250 milliseconds.
- **Uptime:**
    - Year 1: 99.9% target.
    - Subsequent Years: 99.95% target.
- **Error Rates:** Below 0.2%.
- **AI Auto-Graded Practice Tests:** Completion time under 30 seconds.

6.3 Security & Data Protection
- **Data at Rest:** All data encrypted using AES-256.
- **Data in Transit:** All data transmission secured using TLS 1.3.
- **Role-Based Access Controls (RBAC):** Strict controls ensuring users only access data relevant to their defined role (Student, Teacher, Administrator).
- **Row-Level Security (RLS):** Implemented via Supabase to enforce data access policies at the database level.
- **Auditing & Logging:** Comprehensive logs maintained for all administrator and teacher actions for accountability.
- **Multi-Factor Authentication (MFA):** Required for sensitive operations (e.g., administrative access).
- **Session Timeouts:** Implemented to prevent unauthorized access from inactive sessions.
- **Disaster Recovery:** Recovery Point Objective (RPO) <= 5 minutes; Recovery Time Objective (RTO) <= 30 minutes.

7. Security and Compliance

7.1 Ohio Senate Bill 29 Compliance
Kenmei is designed with "extreme security" as a foundational principle, specifically ensuring full compliance with Ohio Senate Bill 29. This means:
- **Prohibited Data:** The platform will NOT access, store, or use any Personally Identifiable Information (PII) or student education records defined as strictly private. This includes, but is not limited to: full legal names, home addresses, phone numbers, email addresses, government IDs, social security numbers, biometric data, IP addresses tied to identity, grades, disciplinary records, and any health-related data.
- **Purpose Limitation:** Prohibited data points will NOT be used for analytics, AI training, or any purpose beyond secure account creation and management, and district-approved functions. The system only stores data necessary for its secure operation and permitted functionalities.

7.2 Data Handling Policy
- **Permitted Data:** Only necessary data points for secure operation and educational functions will be processed. This includes usernames, study activity (time spent, flashcard performance, game scores), classroom membership, and district affiliation. This data is handled with utmost care.
- **Anonymization/Pseudonymization:** Where aggregate data is displayed (e.g., leaderboards), personal identifiers will be anonymized or pseudonymized unless a student explicitly opts in to reveal their specific identifier.

7.3 Security Measures
- **Multi-Layered Security:** Implementation of various security layers to protect permitted data.
- **Encryption:** AES-256 encryption for all data at rest; TLS 1.3 for all data in transit.
- **Strict Role-Based Access Controls (RBAC):** Ensures users can only access data relevant to their role.
- **Comprehensive Auditing and Logging:** All administrator and teacher actions are logged to ensure accountability and detect unauthorized activities.
- **Multi-Factor Authentication (MFA):** Required for sensitive operations.
- **Session Timeouts:** Automatic logouts after periods of inactivity.

8. Project Timeline & Scope

8.1 MVP Scope (Pilot)
- **Timeline:** Development of the MVP for the pilot program is targeted for completion within the next 2 weeks.
- **Included Features:** All features detailed in Section 4 are part of the MVP. This includes flashcard creation, active recall study sessions, core AI study assistant functionalities (study guides, practice tests, interactive questions), initial memory games, teacher-viewable study time, and the full implementation of Ohio SB 29 compliance measures.

8.2 Future Considerations
- While no specific subsequent feature releases are currently planned beyond the MVP, the system architecture (Supabase) and development approach will prioritize scalability to accommodate significant user growth (30,000+ users initially, scaling to 100,000+).
- Continuous monitoring and optimization of performance and security post-launch.

## Technology Stack
TECHNOLOGY STACK

The Kenmai platform is engineered with a modern, secure, and scalable technology stack designed to meet the unique requirements of educational environments, especially regarding data privacy and performance. Our primary focus is on rapid development for the MVP, while ensuring robust scalability for future growth and strict compliance with Ohio Senate Bill 29. The chosen stack leverages managed services to minimize operational overhead and accelerate feature delivery.

I. Core Platform
*   Supabase: Serves as the foundational backend-as-a-service (BaaS) for Kenmai. Supabase provides a comprehensive suite of tools including a PostgreSQL database, authentication services, real-time APIs, and integrated storage. This choice aligns directly with our need for rapid MVP development, inherent scalability, robust security features (e.g., Row Level Security, built-in encryption), and simplified infrastructure management, allowing the team to focus on core features.

II. Frontend
*   React: Chosen as the primary JavaScript library for building the user interface. React's component-based architecture is ideal for developing complex, interactive features like flashcards, memory games, and dynamic study dashboards. Its extensive ecosystem and strong community support enable rapid development and high performance.
*   Next.js: Utilized as the React framework for its server-side rendering (SSR) capabilities, which improve initial page load times and search engine optimization (SEO), though performance and developer experience remain key benefits for Kenmai. Next.js also provides a robust routing system and API routes (though we primarily use Supabase Edge Functions for custom backend logic).
*   Tailwind CSS: Employed for styling. Tailwind's utility-first approach facilitates rapid, consistent, and highly customizable UI development. This enables us to easily implement the desired simplistic design with Japanese-inspired color palettes, ensuring a unique and inviting aesthetic.
*   Radix UI (or similar headless UI library): Integrated for foundational, accessible UI components. Radix UI provides unstyled components for common UI patterns (e.g., dialogs, dropdowns) that can be fully styled with Tailwind CSS, accelerating development while ensuring robust accessibility and maintaining the desired custom look and feel.

III. Backend & Business Logic
*   Supabase Edge Functions (Deno/TypeScript): Critical for implementing custom business logic that extends beyond standard database operations, such as the SM-2 active recall algorithm, complex gamification scoring, detailed study time tracking, and orchestration of AI interactions. Edge Functions run close to the database, ensuring low latency crucial for meeting our API performance KPIs (e.g., flashcard review under 150ms). Using TypeScript enhances code quality and maintainability.

IV. Database
*   PostgreSQL (via Supabase): The core relational database for storing all application data, including user accounts, flashcards, decks, study sessions, classroom configurations, district affiliations, and leaderboard data. PostgreSQL's robust features, reliability, and scalability are well-suited for a growing educational platform. Crucially, Supabase's implementation of PostgreSQL allows for Row Level Security (RLS), which is fundamental for enforcing data privacy and compliance with Ohio SB 29 by ensuring users can only access data relevant to their role and permissions.

V. AI Integration
*   ChatGPT API (OpenAI): The primary large language model (LLM) for generating AI-powered study guides, practice tests, and interactive questions.
*   Modular AI Service Layer (via Edge Functions): An abstraction layer implemented within the Edge Functions to encapsulate all interactions with the ChatGPT API. This design allows for seamless integration of other AI providers in the future, if required, without significant architectural changes. The AI processing adheres strictly to privacy constraints, analyzing only flashcard content and performance signals from the SM-2 engine without storing or processing prohibited PII.

VI. Authentication & Authorization
*   Supabase Auth: Manages user authentication (registration, login, session management) for Student, Teacher, and Administrator accounts. It supports various authentication methods and integrates seamlessly with PostgreSQL Row Level Security.
*   Role-Based Access Control (RBAC): Implemented through a combination of Supabase Auth and PostgreSQL RLS. This ensures that users can only access features and data appropriate for their assigned role, a critical aspect of security and compliance.
*   Multi-Factor Authentication (MFA): Supported by Supabase Auth and will be enabled for sensitive accounts (e.g., Teachers, Administrators) to add an extra layer of security.
*   Session Management: Handled by Supabase, including secure session cookies and configurable session timeouts, to mitigate unauthorized access risks.

VII. Storage
*   Supabase Storage: Utilized for securely storing binary assets such as images (for flashcards) and potentially generated downloadable PDFs (study guides, practice tests). Storage buckets are secured with granular policies to control access, aligning with data security requirements.

VIII. Real-time Capabilities
*   Supabase Realtime: Leveraged for features requiring instant data synchronization, such as leaderboards in games, ensuring scores and rankings are updated in near real-time. This enhances the gamified experience and promotes competition.

IX. Deployment & Hosting
*   Vercel: The chosen platform for deploying the frontend React application. Vercel offers an excellent developer experience, global content delivery network (CDN), and automatic deployments from Git repositories, enabling rapid iteration and ensuring high availability and performance for users worldwide.
*   Supabase (Managed Service): Hosts the entire backend infrastructure, including database, authentication, storage, and edge functions. Its managed nature ensures high availability, automated backups, scaling, and security updates, directly supporting our uptime and disaster recovery objectives.

X. Security & Compliance (Ohio Senate Bill 29)
*   Data Encryption: All data at rest is encrypted using AES-256 (managed by Supabase), and all data in transit uses TLS 1.3, ensuring end-to-end data protection.
*   Row Level Security (RLS): Rigorously applied at the database level to ensure data isolation and prevent unauthorized access to specific rows (e.g., a student can only see their own flashcards or flashcards within their assigned classroom/district).
*   PII Prohibition: The application is designed from the ground up to not access, store, or use any personally identifiable information (PII) prohibited by Ohio SB 29 beyond what is strictly necessary for account creation and secure operation (e.g., usernames, study activity, classroom membership, but NOT full names, emails, addresses, etc.).
*   Auditing & Logging: Comprehensive logging of administrator and teacher actions will be implemented within the backend (Edge Functions and database audit trails) to ensure accountability and track data access.
*   Anonymization/Pseudonymization: Where aggregate data (e.g., leaderboards) is displayed, measures will be taken to anonymize or pseudonymize data unless explicit opt-in is provided, further protecting user privacy.
*   Secure Design Principles: Adherence to security best practices, including input validation, secure coding, and regular security reviews, to minimize vulnerabilities.

XI. Development & Operations
*   Version Control: Git (GitHub/GitLab) for collaborative code management and version tracking.
*   Package Management: npm/Yarn for managing project dependencies.
*   Code Quality: ESLint and Prettier for maintaining consistent code style and identifying potential issues early in the development cycle.
*   TypeScript: Used across the entire stack (Frontend and Edge Functions) for improved code readability, maintainability, and early error detection through static type checking.

This robust technology stack provides the foundation for Kenmai to deliver a secure, performant, and engaging learning experience, while strictly adhering to privacy regulations and enabling rapid iterations for the pilot program and future scaling.

## Project Structure
PROJECT STRUCTURE

This document outlines the file and folder organization for the Kenmei project, providing a detailed overview of its architecture and the purpose of each component. The structure is designed for clarity, scalability, security compliance (Ohio SB 29), and efficient development, supporting its core features such as interactive flashcards, AI-powered study tools, gamified learning, and distinct user roles (Student, Teacher, Administrator).

1. Top-Level Directory Structure

.github/
  Contains GitHub-specific files, primarily for CI/CD workflows, issue templates, and pull request templates. This ensures automated testing, deployment, and standardized development practices.

config/
  Houses environment-specific configurations and global settings that are not part of the source code itself, but are essential for application behavior across different environments (development, staging, production).

database/
  Manages all database-related assets, including schema definitions, migration scripts, and seeding data. Essential for version controlling the database structure hosted on Supabase and ensuring consistency across deployments.

docs/
  Repository for project documentation, including architectural diagrams, API specifications, and deployment guides.

public/
  Contains static assets that are served directly by the web server without any processing. This includes static images, favicon, and other public resources.

scripts/
  A collection of standalone utility scripts for various operational tasks such as data processing, deployment helpers, or maintenance scripts that are not part of the main application logic.

src/
  The core directory containing all application source code, logically separated into frontend, backend (API), and shared modules. This is where the majority of development efforts will be focused.

tests/
  Dedicated folder for all automated tests (unit, integration, end-to-end), ensuring the reliability and correctness of the application's features.

.env.example
  Example file for environment variables, guiding developers on necessary configurations without exposing sensitive data.

.gitignore
  Specifies intentionally untracked files and directories that Git should ignore, such as build artifacts, dependency modules, and sensitive environment files.

package.json
  Defines project metadata, scripts for development and deployment, and lists all project dependencies and devDependencies.

README.md
  The primary project README file, providing a high-level overview, setup instructions, and quick start guides for contributors.

tsconfig.json
  TypeScript configuration file, defining compiler options and project settings for TypeScript files.

2. Detailed src/ Directory Breakdown

The src/ directory is the heart of the Kenmei application, structured to promote modularity, maintainability, and clear separation of concerns.

src/api/
  Houses the backend API endpoints, primarily implemented as Supabase Edge Functions. These functions handle business logic, data interactions, and integrations with external services like the ChatGPT API. Security is paramount here, with strict validation and access controls for all data operations.

  src/api/auth/
    Endpoints related to user authentication, registration, session management, and password resets. Integrates with Supabase Auth services and enforces role-based access controls.

  src/api/users/
    APIs for managing user profiles, including creation, retrieval, updates, and deletions for Student, Teacher, and Administrator accounts. This module is critical for district and classroom management features.

  src/api/flashcards/
    Endpoints for creating, editing, fetching, and deleting flashcard decks and individual flashcards. Supports text and image content.

  src/api/study/
    API for handling flashcard study sessions. This includes applying the SM-2 spaced repetition algorithm, updating card ease factors and intervals, and tracking study metrics like time spent studying, accuracy, and confidence. This is where the core active recall logic resides.

  src/api/games/
    Backend logic for the gamified memory games, including managing game state, processing user actions, scoring, and integrating with leaderboards. Handles Speed Recall Challenge, Matching Mode, and Battle Quiz.

  src/api/ai/
    Dedicated service for AI integrations. This includes endpoints for sending requests to the ChatGPT API, processing responses to generate study guides, practice tests, and interactive questions based on flashcard sets. Ensures data privacy by not sending prohibited PII to the AI model.

  src/api/districts/
    APIs for managing district entities, including creation, approval processes, and associating teachers and students with districts.

  src/api/classrooms/
    Endpoints for teachers to create and manage classrooms, generate classroom codes, and add/remove students. Essential for teacher oversight and student tracking.

  src/api/leaderboards/
    APIs for managing and retrieving leaderboard data, including calculating scores and rankings for classroom and district levels. Implements opt-out functionality for student privacy.

  src/api/reports/
    Endpoints for generating reports, specifically for teachers to view student study time and progress metrics. Adheres strictly to Ohio SB 29 regarding permissible data access.

src/assets/
  Stores static assets directly used by the application interface, typically processed by the build pipeline.

  src/assets/images/
    Application images, illustrations, and icons (e.g., logo, decorative elements).

  src/assets/fonts/
    Custom fonts used throughout the application to maintain consistent branding and user experience.

src/components/
  Contains reusable UI components, categorized by their scope and purpose. This modular approach facilitates consistent design and faster development.

  src/components/common/
    Highly generic and widely used UI components that are not specific to any particular feature or section (e.g., buttons, modals, forms).

  src/components/ui/
    Atomic components that form the Kenmei design system, enforcing Japanese-inspired color schemes (sakura) and a simplistic, inviting aesthetic (e.g., typography, basic layouts).

  src/components/auth/
    Components related to user authentication (login forms, registration forms).

  src/components/flashcards/
    Components for displaying and interacting with flashcards and decks (e.g., flashcard viewer, deck editor, card creation).

  src/components/games/
    UI components specific to the various memory games (e.g., game boards, scoring displays, timer).

  src/components/admin/
    Interface components exclusive to the Administrator role (e.g., district approval dashboards, user management).

  src/components/teacher/
    Interface components for Teachers (e.g., classroom management, student progress dashboards, study time reports).

  src/components/student/
    Interface components for Students (e.g., dashboard, study progress, game interfaces).

src/lib/
  Houses shared utility functions, helper modules, and core logic that is not directly tied to UI components or specific API endpoints, but is consumed by both.

  src/lib/utils/
    General utility functions (e.g., date formatting, string manipulation).

  src/lib/auth/
    Helper functions and wrappers for interacting with Supabase Authentication, managing user sessions, and enforcing client-side role checks.

  src/lib/constants/
    Global constants and configuration values used across the application.

  src/lib/hooks/
    Custom React hooks for encapsulating complex stateful logic or side effects, promoting reusability in frontend components.

  src/lib/ai/
    Client-side logic for interacting with the AI API, structuring prompts, and processing AI responses for display. Includes logic for personalization based on flashcard data and SM-2 performance.

  src/lib/sm2/
    Implementation details of the SM-2 spaced repetition algorithm, including calculation of ease factors, intervals, and memory growth scores based on user feedback.

  src/lib/db/
    Supabase client initialization and helper functions for database interactions, abstracting direct API calls for frontend and Edge Functions.

  src/lib/security/
    Critical module for enforcing Ohio SB 29 compliance and general data security best practices. Contains functions for data anonymization/pseudonymization, input validation, and secure data handling procedures for permitted data.

  src/lib/gamification/
    Core logic for gamification mechanics, including point calculation, streak management, and leaderboard updates.

src/pages/
  Defines the routes and main views of the frontend application. Each file typically corresponds to a unique URL path.

  src/pages/index.tsx
    The main landing page of the application.

  src/pages/auth/
    Authentication-related pages (login, signup, reset password).

  src/pages/dashboard/
    The primary dashboard for logged-in users, displaying an overview of their progress and available features based on their role.

  src/pages/decks/
    Pages for browsing, creating, and managing flashcard decks.

  src/pages/study/
    The core study session interface where users interact with flashcards based on the SM-2 algorithm.

  src/pages/games/
    Pages for selecting and playing the various memory games.

  src/pages/ai-study/
    Pages for interacting with AI-generated study guides and practice tests.

  src/pages/admin/
    Administrator-specific pages for system oversight and management.

  src/pages/teacher/
    Teacher-specific pages for classroom and student management, and access to study reports.

  src/pages/student/
    Student-specific pages for tracking personal progress, joining classrooms, and accessing core features.

  src/pages/settings/
    User profile and application settings.

  src/pages/leaderboards/
    Pages displaying classroom and district leaderboards.

src/styles/
  Manages the application's visual styling.

  src/styles/global.css
    Global CSS styles, resets, and base typography.

  src/styles/theme/
    CSS variables and definitions for Kenmei's Japanese-inspired color palette and thematic elements, ensuring a consistent and inviting aesthetic.

  src/styles/components/
    Component-specific styles that are not directly inline or scoped within component files, if a global approach is preferred.

src/types/
  Centralized location for TypeScript type definitions and interfaces, ensuring strong typing and improved code maintainability across the project.

3. Database Directory (`database/`)

database/migrations/
  SQL migration scripts for evolving the Supabase Postgres database schema. Each script represents a versioned change (e.g., adding tables, columns, constraints).

database/seeders/
  Scripts for populating the database with initial or test data, useful for setting up development environments or predefined content.

database/schema.sql
  A consolidated SQL file representing the current state of the database schema, including table definitions, indices, and critical Row-Level Security (RLS) policies that enforce data privacy and role-based access control, crucial for Ohio SB 29 compliance.

4. Configuration Directory (`config/`)

config/supabase.ts
  Configuration specific to the Supabase client, including API keys, URLs, and any custom settings for its services (Auth, Database, Storage, Edge Functions).

config/app.ts
  General application settings such as application name, default locale, and other global parameters.

config/security.ts
  Configuration specific to security policies, potentially including allowed origins, rate limits, and explicit declarations of data privacy compliance measures.

5. Test Directory (`tests/`)

tests/unit/
  Contains unit tests for individual functions, components, and modules, ensuring their isolated correctness.

tests/integration/
  Houses integration tests that verify the interaction between different modules or services (e.g., API endpoint interacting with the database).

tests/e2e/
  End-to-end tests that simulate full user flows through the application, typically using browser automation tools.

6. CI/CD & Deployment (`.github/`)

.github/workflows/
  GitHub Actions workflow definitions for automated build, test, and deployment pipelines. This includes workflows for deploying Edge Functions, database migrations, and frontend builds to Supabase hosting, ensuring continuous delivery and high uptime targets.

This structured approach supports Kenmei's rapid development goals, scalability for a growing user base, and stringent security and privacy requirements for K-12 education.

## Database Schema Design
SCHEMADESIGN

This section outlines the database schema design for the Kenmei platform, detailing the entities, their attributes, and relationships. The design prioritizes compliance with Ohio Senate Bill 29 regarding data privacy, aiming for extreme security, minimal data storage, and strict role-based access control. The chosen database is PostgreSQL, leveraging Supabase's capabilities for authentication, real-time features, and storage.

**1. Core User and Organizational Structure**

*   **`districts` Table**
    *   **Purpose**: Stores information about educational districts adopting Kenmei. District approval is managed by administrators.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Unique identifier for the district.
        *   `name` (TEXT, NOT NULL) - Name of the district (e.g., "Columbus City Schools").
        *   `approval_status` (TEXT, NOT NULL, DEFAULT 'pending') - Current approval status: 'pending', 'approved', 'rejected'.
        *   `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Timestamp of district creation.
        *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Last update timestamp for the district record.

*   **`profiles` Table**
    *   **Purpose**: Extends the Supabase `auth.users` table, storing Kenmei-specific user profile information while strictly adhering to Ohio SB 29 by avoiding PII.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Foreign Key to Supabase's `auth.users.id`.
        *   `username` (TEXT, UNIQUE, NOT NULL) - User's unique display name. This is the primary identifier used across the platform for privacy compliance.
        *   `role` (TEXT, NOT NULL) - User's role: 'student', 'teacher', or 'administrator'. (Consider ENUM type for strictness).
        *   `district_id` (UUID, NULL) - Foreign Key to `districts.id`. Identifies the district the user is affiliated with. Null for administrators or users not yet assigned.
        *   `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Timestamp of profile creation.
        *   `last_login_at` (TIMESTAMP WITH TIME ZONE) - Last successful login timestamp.
        *   `leaderboard_opt_in` (BOOLEAN, NOT NULL, DEFAULT TRUE) - User preference to appear on leaderboards (if opted out, username is anonymized/hidden).

*   **`classrooms` Table**
    *   **Purpose**: Stores information about classrooms created by teachers within a district.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Unique identifier for the classroom.
        *   `name` (TEXT, NOT NULL) - Name of the classroom (e.g., "Algebra I - Period 3").
        *   `classroom_code` (TEXT, UNIQUE, NOT NULL) - A unique code students use to join the classroom.
        *   `teacher_id` (UUID, NOT NULL) - Foreign Key to `profiles.id`, identifying the teacher who owns the classroom.
        *   `district_id` (UUID, NOT NULL) - Foreign Key to `districts.id`, ensuring the classroom belongs to the teacher's district.
        *   `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Timestamp of creation.
        *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Last update timestamp.

*   **`student_classroom_memberships` Table**
    *   **Purpose**: Manages the many-to-many relationship between students and classrooms.
    *   **Columns**:
        *   `student_id` (UUID, Primary Key, Foreign Key to `profiles.id`) - ID of the student.
        *   `classroom_id` (UUID, Primary Key, Foreign Key to `classrooms.id`) - ID of the classroom.
        *   `joined_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Timestamp when the student joined the classroom.

**2. Flashcard and Study Content**

*   **`decks` Table**
    *   **Purpose**: Stores information about flashcard decks created by users.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Unique identifier for the deck.
        *   `owner_id` (UUID, NOT NULL) - Foreign Key to `profiles.id`, identifying the user (student or teacher) who owns the deck.
        *   `name` (TEXT, NOT NULL) - Name of the flashcard deck (e.g., "Biology Chapter 5 Vocabulary").
        *   `description` (TEXT) - Optional description for the deck.
        *   `is_public` (BOOLEAN, NOT NULL, DEFAULT FALSE) - Flag indicating if the deck is publicly accessible (for future sharing features).
        *   `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Timestamp of creation.
        *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Last update timestamp.

*   **`flashcards` Table**
    *   **Purpose**: Stores individual flashcards, which can include text and/or image content.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Unique identifier for the flashcard.
        *   `deck_id` (UUID, NOT NULL) - Foreign Key to `decks.id`, linking the flashcard to its parent deck.
        *   `front_content_text` (TEXT) - Text content displayed on the front of the card.
        *   `front_content_image_url` (TEXT) - URL for an image on the front (stored in Supabase Storage).
        *   `back_content_text` (TEXT) - Text content displayed on the back of the card.
        *   `back_content_image_url` (TEXT) - URL for an image on the back.
        *   `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Timestamp of creation.
        *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Last update timestamp.

*   **`user_card_progress` Table**
    *   **Purpose**: Stores individual user's progress and SM-2 algorithm parameters for each flashcard.
    *   **Columns**:
        *   `user_id` (UUID, Primary Key, Foreign Key to `profiles.id`) - ID of the user.
        *   `flashcard_id` (UUID, Primary Key, Foreign Key to `flashcards.id`) - ID of the flashcard.
        *   `ease_factor` (NUMERIC(5, 2), NOT NULL, DEFAULT 2.5) - SM-2 ease factor, adjusts difficulty (e.g., 2.5 for new cards).
        *   `interval_days` (INTEGER, NOT NULL, DEFAULT 0) - SM-2 interval in days, determines next review time.
        *   `repetitions` (INTEGER, NOT NULL, DEFAULT 0) - Number of successful repetitions for the SM-2 algorithm.
        *   `last_reviewed_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Timestamp of the most recent review by this user.
        *   `next_review_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - The calculated timestamp for the next scheduled review.
        *   `last_confidence_rating` (INTEGER) - User's last confidence rating (e.g., 1-5).
        *   `last_accuracy_rating` (BOOLEAN) - Whether the user's last recall was correct.
        *   `total_reviews` (INTEGER, NOT NULL, DEFAULT 0) - Total number of times this user has reviewed this card.
        *   `correct_reviews` (INTEGER, NOT NULL, DEFAULT 0) - Total number of times this user answered this card correctly.

*   **`study_sessions` Table**
    *   **Purpose**: Tracks individual study sessions to monitor time spent studying, which is visible to teachers.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Unique identifier for the study session.
        *   `user_id` (UUID, NOT NULL, Foreign Key to `profiles.id`) - ID of the user who performed the study.
        *   `deck_id` (UUID, NULL, Foreign Key to `decks.id`) - The deck associated with the session (if applicable, e.g., flashcard review).
        *   `session_type` (TEXT, NOT NULL) - Type of activity: 'flashcard_review', 'game', 'ai_test'.
        *   `start_time` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Session start time.
        *   `end_time` (TIMESTAMP WITH TIME ZONE) - Session end time (can be null if session is still in progress).
        *   `duration_minutes` (NUMERIC(6, 2)) - Calculated duration of the session in minutes.

**3. AI Integration and Generated Content**

*   **`ai_generated_contents` Table**
    *   **Purpose**: Stores general AI-generated content like study guides.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Unique identifier for the generated content.
        *   `user_id` (UUID, NOT NULL, Foreign Key to `profiles.id`) - User who initiated the AI generation.
        *   `deck_id` (UUID, NOT NULL, Foreign Key to `decks.id`) - The source flashcard deck used for AI generation.
        *   `content_type` (TEXT, NOT NULL) - Type of content: 'study_guide', 'practice_test'.
        *   `title` (TEXT, NOT NULL) - A user-friendly title for the generated content.
        *   `generated_text` (TEXT) - The complete generated text content (e.g., for a study guide).
        *   `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Timestamp of generation.
        *   `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Last update timestamp (if content can be edited or re-generated).

*   **`practice_tests` Table**
    *   **Purpose**: Stores structured practice tests generated by AI from flashcard decks.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Unique identifier for the practice test.
        *   `ai_content_id` (UUID, NULL, Foreign Key to `ai_generated_contents.id`) - Link to a general AI content record (optional, if a test is also a "generated content").
        *   `user_id` (UUID, NOT NULL, Foreign Key to `profiles.id`) - User who owns or initiated the test.
        *   `deck_id` (UUID, NOT NULL, Foreign Key to `decks.id`) - The source flashcard deck for the test questions.
        *   `title` (TEXT, NOT NULL) - Title of the practice test.
        *   `status` (TEXT, NOT NULL, DEFAULT 'generated') - Current status: 'generated', 'in_progress', 'completed'.
        *   `score` (NUMERIC(5, 2)) - Final score achieved on the test (e.g., percentage).
        *   `total_questions` (INTEGER) - Total number of questions in the test.
        *   `questions_data` (JSONB) - Stores the array of questions, including question text, type, options, correct answer, rationale, and source `flashcard_id` references. This flexible JSONB allows for various question formats (MCQ, short answer, matching).
        *   `started_at` (TIMESTAMP WITH TIME ZONE) - Timestamp when the user started the test.
        *   `completed_at` (TIMESTAMP WITH TIME ZONE) - Timestamp when the user completed the test.
        *   `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Test generation timestamp.

*   **`user_test_attempts` Table**
    *   **Purpose**: Records individual user answers and correctness for each question within a `practice_test`.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Unique identifier for an attempt record.
        *   `practice_test_id` (UUID, NOT NULL, Foreign Key to `practice_tests.id`) - The practice test being attempted.
        *   `user_id` (UUID, NOT NULL, Foreign Key to `profiles.id`) - User who submitted the answer.
        *   `attempt_number` (INTEGER, NOT NULL, DEFAULT 1) - Which attempt this is for the specific test.
        *   `question_index` (INTEGER, NOT NULL) - Index of the question within the `practice_tests.questions_data` JSONB.
        *   `user_answer` (TEXT) - The user's submitted text answer (for short answer questions).
        *   `user_selected_options` (JSONB) - For multiple-choice/matching questions, an array of selected option IDs/values.
        *   `is_correct` (BOOLEAN) - Whether the user's answer for this question was correct.
        *   `submitted_at` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Timestamp when the answer was submitted.

**4. Gamification and Leaderboards**

*   **`game_sessions` Table**
    *   **Purpose**: Stores results of various memory games played by users for gamification and leaderboards.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Unique identifier for a game session.
        *   `user_id` (UUID, NOT NULL, Foreign Key to `profiles.id`) - User who played the game.
        *   `deck_id` (UUID, NOT NULL, Foreign Key to `decks.id`) - The deck used for the game session.
        *   `game_type` (TEXT, NOT NULL) - Type of game played: 'speed_recall_challenge', 'matching_mode', 'battle_quiz'.
        *   `start_time` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Game session start time.
        *   `end_time` (TIMESTAMP WITH TIME ZONE) - Game session end time.
        *   `score` (INTEGER, NOT NULL, DEFAULT 0) - Final score achieved in the session.
        *   `classroom_id` (UUID, NULL, Foreign Key to `classrooms.id`) - Optional: If the game was played within a specific classroom context.
        *   `is_leaderboard_eligible` (BOOLEAN, NOT NULL, DEFAULT TRUE) - Flag indicating if this session's score is eligible for leaderboards.

**5. Auditing and Logging (Security and Compliance)**

*   **`audit_logs` Table**
    *   **Purpose**: Records significant actions and access events for accountability, especially for administrator and teacher activities, as required by security compliance. No PII is logged here.
    *   **Columns**:
        *   `id` (UUID, Primary Key) - Unique identifier for the log entry.
        *   `user_id` (UUID, NULL, Foreign Key to `profiles.id`) - ID of the user who performed the action (NULL for system-initiated actions).
        *   `action_type` (TEXT, NOT NULL) - Description of the action (e.g., 'user_login', 'deck_created', 'classroom_added', 'district_approved').
        *   `resource_type` (TEXT) - The type of resource affected (e.g., 'profile', 'deck', 'classroom', 'district').
        *   `resource_id` (UUID) - ID of the specific resource affected.
        *   `details` (JSONB) - Additional context or non-PII attributes of the action (e.g., 'new_status: approved').
        *   `timestamp` (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT NOW()) - Timestamp of the action.

**Relationships and Constraints**

*   **One-to-Many**:
    *   `districts` to `profiles` (for teachers and students), `classrooms`.
    *   `profiles` (teacher role) to `classrooms`.
    *   `profiles` to `decks`, `study_sessions`, `ai_generated_contents`, `practice_tests`, `game_sessions`, `audit_logs`.
    *   `decks` to `flashcards`.
    *   `classrooms` to `student_classroom_memberships`.
    *   `practice_tests` to `user_test_attempts`.
*   **Many-to-Many**:
    *   `profiles` (student role) to `classrooms` via `student_classroom_memberships`.
    *   `profiles` to `flashcards` via `user_card_progress`.
*   **Foreign Key Constraints**: All foreign key relationships ensure data integrity.
*   **Unique Constraints**: `profiles.username`, `classrooms.classroom_code`.
*   **Indexes**: Crucial columns for querying (e.g., foreign keys, `user_card_progress.next_review_at`, `study_sessions.user_id`, `game_sessions.user_id`, `practice_tests.user_id`) will be indexed for performance.

**Row-Level Security (RLS) Policies**

Leveraging Supabase's RLS, strict policies will be implemented for each table to enforce role-based access control and data privacy:

*   **`profiles`**: Users can view/update only their own profile data (e.g., `leaderboard_opt_in`). Teachers can view profiles of students in their classrooms. Administrators have executive access to all profiles.
*   **`districts`**: All users can view district names. Only administrators can create, update, or delete districts.
*   **`classrooms`**: Teachers can manage (create, read, update, delete) their own classrooms. Students can view classrooms they are members of. Administrators can manage all.
*   **`student_classroom_memberships`**: Students can join/leave classrooms. Teachers can add/remove students from their classrooms. Administrators have full control.
*   **`decks`**: Owners (teachers/students) can manage their own decks. Teachers can view decks owned by students in their classrooms.
*   **`flashcards`**: Access controlled by parent `deck_id` ownership.
*   **`user_card_progress`**: Users can only access their own progress. Teachers can view progress for students in their classrooms.
*   **`study_sessions`**: Users can view their own study sessions. Teachers can view sessions for students in their classrooms.
*   **`ai_generated_contents`, `practice_tests`, `user_test_attempts`**: Access is based on `user_id` ownership. Teachers can view content/attempts for students in their classrooms.
*   **`game_sessions`**: Users can view their own game history. Teachers can view game sessions for students in their classrooms. Leaderboards will use RLS to anonymize display names for users who have opted out.
*   **`audit_logs`**: Only administrators can view audit logs.

**Security and Compliance Measures**

*   **No PII Storage**: As mandated by Ohio SB 29, no Personally Identifiable Information (PII) such as full names, email addresses, phone numbers, etc., will be stored or accessed. Usernames serve as the primary identifier.
*   **Data Encryption**: All data at rest will be encrypted using AES-256 (handled by Supabase). All data in transit will use TLS 1.3.
*   **Role-Based Access Control (RBAC)**: Enforced via PostgreSQL Row-Level Security (RLS) policies within Supabase, ensuring users only access data relevant to their defined role.
*   **Anonymization/Pseudonymization**: Applied to aggregate data (e.g., leaderboards) where personal identifiers would otherwise be displayed, unless a user explicitly opts in.
*   **Auditing**: Comprehensive logging of administrator and teacher actions will be maintained in the `audit_logs` table for accountability.
*   **Supabase Features**: Leverage Supabase's built-in authentication, storage, real-time capabilities, and RLS to ensure a secure, compliant, and scalable database infrastructure.

## User Flow
USERFLOW

Kenmei's user flows are designed to provide intuitive and secure learning experiences for students, teachers, and district administrators. The system emphasizes simplicity, active recall, AI-powered learning, and gamification, all while adhering strictly to Ohio Senate Bill 29's privacy requirements. Each interaction prioritizes user-friendliness, data protection, and a visually inviting interface inspired by Japanese aesthetics.

**1. User Roles & Core Permissions**
Kenmei supports three distinct user roles, each with specific permissions and access levels:

*   **Student:** Primary learners. Can create/manage flashcard decks, study using the SM-2 algorithm, play memory games, generate AI study content, and view leaderboards (with opt-out). Can join classrooms.
*   **Teacher:** Educators managing classrooms. Can create/manage classrooms, add students via code, track student study time, create/share flashcard decks, and generate AI study content for their class. Can approve district affiliation for their students.
*   **Administrator:** District-level oversight. Can approve district affiliation requests, and has executive access to teacher and student accounts. Currently has no additional features but serves as a foundational role for future district-level management.

All interactions are secured with TLS 1.3 encryption for data in transit and AES-256 for data at rest. Role-based access controls (RBAC) are strictly enforced to ensure users only access data relevant to their role and permissions, in full compliance with Ohio SB 29.

**2. Core User Flows**

**2.1. Account Creation & Login**

*   **Goal:** Allow users (Student, Teacher, Administrator) to securely create an account and log in.
*   **Actors:** Student, Teacher, Administrator.
*   **Preconditions:** User has access to the Kenmei website.
*   **Triggers:** User navigates to the Kenmei homepage or login page.

*   **Flow:**
    *   **Step 1: Landing Page / Login Prompt**
        *   *User Action:* Clicks "Sign Up" or "Login" button.
        *   *System Response:* Presents a clear, simple interface. For "Sign Up," prompts selection of account type (Student, Teacher, Administrator). For "Login," displays username/password fields.
        *   *Wireframe/UI Description:* Initial screen features a prominent Kenmei logo, inviting imagery, and distinct "Login" and "Sign Up" calls to action. Sakura-inspired color palette dominant. Account type selection is a simple radio button or dropdown.
        *   *Interaction Pattern:* Direct navigation; clear button presses.
        *   *Security/Privacy:* No PII collected at this stage beyond a chosen username and securely hashed password. No email or other identifiers are requested for initial signup to align with Ohio SB 29. User is informed about privacy policy adherence.

    *   **Step 2: Registration Form (for new users)**
        *   *User Action:* Enters desired username and password (twice for confirmation).
        *   *System Response:* Validates input (e.g., password strength, username availability). Displays real-time feedback for errors. Upon valid input, creates account and securely stores hashed credentials. Prompts for optional district affiliation.
        *   *Wireframe/UI Description:* A clean, minimalistic form with input fields for username and password. Password strength indicator is subtly present. A checkbox or prompt for "Join a District?" appears at the bottom. The interface remains simple and uncluttered.
        *   *Interaction Pattern:* Form submission; client-side validation, followed by server-side account creation.
        *   *Security/Privacy:* Username and securely hashed password are the *only* data points collected for account creation. No IP addresses or other tracking data tied to identity are stored. All data transmitted via TLS 1.3. User is prompted to accept terms of service that explicitly state compliance with Ohio SB 29 and data practices.

    *   **Step 3: District Affiliation (Optional during signup or via Profile)**
        *   *User Action:* Selects "Join a District" and enters a District ID or name, then sends a request.
        *   *System Response:* Records the affiliation request. If the user is a Student or Teacher, the request is sent to the District Administrator for approval. If the user is an Administrator, they can immediately set up their district profile (though no further features yet).
        *   *Wireframe/UI Description:* A modal or dedicated page after signup. Search bar for district names/IDs. "Send Request" button. Confirmation message upon submission.
        *   *Interaction Pattern:* Search and submit; asynchronous request to database.
        *   *Security/Privacy:* District affiliation is recorded pseudonymously. No student PII is linked to district affiliation beyond their Kenmei username. District names themselves are public and not considered PII.

    *   **Step 4: Login Authentication (for returning users)**
        *   *User Action:* Enters username and password, clicks "Login."
        *   *System Response:* Authenticates credentials. If successful, redirects to user dashboard based on role. If unsuccessful, displays error message (e.g., "Invalid username or password").
        *   *Wireframe/UI Description:* Simple login form. Error messages are unobtrusive and clear. A "Forgot Password?" link is available.
        *   *Interaction Pattern:* Form submission; server-side authentication; session management. Multi-factor authentication (MFA) will be an option for sensitive operations, particularly for teachers and administrators.
        *   *Security/Privacy:* All authentication attempts are logged for auditing (without linking to PII). Session tokens are short-lived and securely stored. Session timeouts are implemented. TLS 1.3 ensures secure transmission of credentials.

*   **Postconditions:** User is logged in and redirected to their respective dashboard, or an account creation request is pending administrator approval.
*   **Alternative Paths/Error Handling:** Incorrect credentials; server errors during signup; district ID not found.

**2.2. Student: Manage Flashcard Decks & Study**

*   **Goal:** Create, organize, and effectively study flashcard decks for optimal memory growth.
*   **Actors:** Student.
*   **Preconditions:** Student is logged in.
*   **Triggers:** Student navigates to "My Decks" from the dashboard or clicks "Create New Deck."

*   **Flow:**
    *   **Step 1: Dashboard / My Decks Overview**
        *   *User Action:* Views personal dashboard, showing recently studied decks, study streaks, and options to create/browse decks.
        *   *System Response:* Displays an organized list of owned and shared flashcard decks. Provides visual cues for progress (e.g., "Ready for Review").
        *   *Wireframe/UI Description:* Dashboard is the central hub. Deck cards display deck name, number of cards, and a "Study" or "Edit" button. Consistent Sakura-inspired palette.
        *   *Interaction Pattern:* Navigation links, card clicks.

    *   **Step 2: Create/Edit Flashcard Deck**
        *   *User Action:* Clicks "Create New Deck" or selects an existing deck to edit.
        *   *System Response:* Presents an interface for adding/editing flashcards within the selected deck.
        *   *Wireframe/UI Description:* Deck creation form: "Deck Name," "Description," "Tags." Card creation form: "Front" and "Back" text fields, image upload button. Intuitive layout with clear save/cancel options. A "Add Card" button continuously adds new card fields. Images are displayed as thumbnails.
        *   *Interaction Pattern:* Form input, file upload via browser dialog, dynamic addition of new card fields.
        *   *Security/Privacy:* Flashcard content (text, images) is stored securely encrypted. No analysis or usage of this content outside the user's specific learning context. Images are stored in an S3-compatible object storage (Supabase Storage) and served securely.

    *   **Step 3: Study Flashcards (SM-2 Algorithm)**
        *   *User Action:* Clicks "Study" on a specific flashcard deck.
        *   *System Response:* Initiates a study session. Displays flashcards one by one based on the SM-2 spaced repetition algorithm, prioritizing cards due for review and difficult cards.
        *   *Wireframe/UI Description:* Study screen shows the "Front" of the current card. A "Reveal Answer" button appears. After revealing, options like "Easy," "Good," "Hard," "Incorrect" (or similar confidence/correctness ratings) are displayed. A progress bar shows session completion. Clean, focused UI with minimal distractions.
        *   *Interaction Pattern:* Click to reveal, click to rate. Keyboard shortcuts for speed. The system dynamically updates the card's ease factor and review interval in the background based on the user's input.
        *   *Security/Privacy:* Study performance data (accuracy, confidence, response time, ease factor) is stored pseudonymously and only used by the SM-2 algorithm to optimize future reviews and by teachers to track study time. This data is not PII.

    *   **Step 4: End Study Session**
        *   *User Action:* Completes all scheduled cards or manually ends the session.
        *   *System Response:* Saves all progress, updates card intervals, and displays a summary of the session (e.g., "Cards Reviewed," "New Cards Learned," "Time Spent Studying").
        *   *Wireframe/UI Description:* Summary screen with key metrics. A "Return to Dashboard" button. Positive reinforcement messaging.
        *   *Interaction Pattern:* Automatic completion or manual button press.
        *   *Security/Privacy:* The "Time Spent Studying" metric is securely stored and made accessible only to the student and their associated teachers (if in a classroom) via RBAC, adhering to Ohio SB 29 regarding educational records.

*   **Postconditions:** Flashcard deck updated, study progress recorded, user's memory growth optimized.

**2.3. Student: Play Memory Games**

*   **Goal:** Engage in interactive, competitive learning based on flashcard content.
*   **Actors:** Student.
*   **Preconditions:** Student is logged in and has access to at least one flashcard deck.
*   **Triggers:** Student selects a deck and clicks "Play Game," then chooses a game type.

*   **Flow:**
    *   **Step 1: Game Selection**
        *   *User Action:* Selects a flashcard deck, then clicks "Play Game" and chooses from "Speed Recall Challenge," "Matching Mode," or "Battle Quiz."
        *   *System Response:* Presents options for game type. For Battle Quiz, prompts for solo or "Offline with Friends" mode.
        *   *Wireframe/UI Description:* A modal or separate page listing available games with brief descriptions. Clear icons for each game. "Offline with Friends" option for Battle Quiz is a prominent button.
        *   *Interaction Pattern:* Click selection.

    *   **Step 2: Game Play (e.g., Speed Recall Challenge)**
        *   *User Action:* Begins the game. Quickly answers questions (flashcard fronts) before a timer runs out.
        *   *System Response:* Presents flashcards rapidly. Tracks correct/incorrect answers, speed, and streaks. Calculates points in real-time. For "Battle Quiz (Offline)," generates questions and provides a method to record friend's scores.
        *   *Wireframe/UI Description:* Game interface is dynamic and engaging. Large, clear text/images for flashcards. Timer visible. Score display updates in real-time. For offline Battle Quiz, a simple interface to select multiple-choice answers and record 'Friend 1 Score', 'Friend 2 Score' etc. upon completion of questions. No direct network connection needed for friends, just a shared screen.
        *   *Interaction Pattern:* Rapid input (typing, clicking buttons). Visual feedback for correctness (e.g., green/red flash). Gamified sounds/animations.
        *   *Gamification:* Points awarded based on base points for correctness, bonus for speed, and streak multipliers. Difficulty weighting ensures harder cards yield more points. Scores are tied to the user's Kenmei username, not PII.

    *   **Step 3: Game Results & Leaderboard Submission**
        *   *User Action:* Completes the game. For "Battle Quiz (Offline)," manually inputs friends' scores.
        *   *System Response:* Displays final score, highlights performance metrics (accuracy, streaks). Asks if the user wants to submit score to classroom/district leaderboards (with an explicit opt-out option).
        *   *Wireframe/UI Description:* Game summary screen shows score, statistics, and a prominent "Submit to Leaderboard" button with an adjacent "No Thanks" option or checkbox. For offline Battle Quiz, a summary of all players' scores is displayed before submission. Leaderboard link.
        *   *Interaction Pattern:* View results, opt-in/opt-out for leaderboard.
        *   *Security/Privacy:* Leaderboard submissions are pseudonymized by default (showing only Kenmei username). Students have an explicit opt-out for appearing on leaderboards. No real names or other PII are displayed unless a specific, secure opt-in mechanism is provided and approved by Ohio SB 29 compliance (which is not planned for MVP PII display).

*   **Postconditions:** Game played, score recorded, option for leaderboard submission taken.

**2.4. Student: Generate AI Study Content**

*   **Goal:** Leverage AI to create personalized study guides and practice tests from flashcard content.
*   **Actors:** Student.
*   **Preconditions:** Student is logged in and has at least one flashcard deck.
*   **Triggers:** Student selects a deck and clicks "AI Tools" or "Generate Study Guide/Practice Test."

*   **Flow:**
    *   **Step 1: AI Tool Selection & Configuration**
        *   *User Action:* Chooses "Generate Study Guide" or "Generate Practice Test" for a specific deck. Configures parameters (e.g., length, question types, focus areas).
        *   *System Response:* Presents configuration options. AI analyzes the selected flashcard deck's content, tags, and the student's SM-2 performance data to personalize the generation.
        *   *Wireframe/UI Description:* A configuration panel/modal. Dropdowns for "Output Type" (Study Guide, Practice Test), sliders/toggles for "Length," "Difficulty," "Include Images," "Question Types" (for tests). Preview of selected deck. Simple, clear labels.
        *   *Interaction Pattern:* Form input, toggle switches, dropdown selections.
        *   *AI Integration/Privacy:* AI (ChatGPT API via modular service layer) receives anonymized flashcard content and performance signals (accuracy, confidence, ease factor from SM-2) as input. No PII is ever sent to the AI model. Prompts are carefully constructed to respect privacy and security constraints.

    *   **Step 2: Content Generation**
        *   *User Action:* Clicks "Generate."
        *   *System Response:* Processes the request, sends anonymized data to the AI service, and displays a loading indicator. Upon completion, presents the generated content.
        *   *Wireframe/UI Description:* Loading spinner or progress bar with a "Generating..." message. Once complete, the generated study guide or practice test is displayed directly in the app, formatted for readability. For practice tests, interactive question flows are presented with input fields.
        *   *Interaction Pattern:* Asynchronous request, progress feedback.
        *   *Performance:* Practice tests completion targeted under 30 seconds.

    *   **Step 3: Review & Utilize AI Content**
        *   *User Action:* Reviews the generated study guide/practice test. For practice tests, answers questions within the app. Can opt to download as PDF or save as "question pool."
        *   *System Response:* Displays study guide (organized summaries, key terms, high-yield concepts) or interactive practice test questions (auto-graded, with instant scoring, per-item feedback, and references back to source cards). Provides options for downloading PDFs or saving question pools.
        *   *Wireframe/UI Description:* Study guide: Clean text layout. Practice test: Question displayed, input field/radio buttons for answers, "Submit" button. Feedback (correct/incorrect, explanation) appears immediately. "Download PDF" and "Save Question Pool" buttons are present.
        *   *Interaction Pattern:* Reading, answering questions, button clicks. AI provides hints, step-by-step solutions, and explanations.
        *   *Security/Privacy:* All generated content remains within the user's session and account. No generated content is used to train the AI model beyond the specific request. Downloaded PDFs are handled by the user's device and not stored on Kenmei's servers after download.

*   **Postconditions:** Personalized study guide or practice test generated and available for use.

**2.5. Teacher: Manage Classrooms & Track Student Progress**

*   **Goal:** Create and manage virtual classrooms, add students, and monitor their study engagement.
*   **Actors:** Teacher.
*   **Preconditions:** Teacher is logged in.
*   **Triggers:** Teacher navigates to "My Classrooms" or clicks "Create New Classroom."

*   **Flow:**
    *   **Step 1: Teacher Dashboard / My Classrooms Overview**
        *   *User Action:* Views teacher dashboard, displaying existing classrooms, pending requests, and options to create/manage classrooms.
        *   *System Response:* Shows a list of classrooms, each with options to view students, generate a join code, or view analytics.
        *   *Wireframe/UI Description:* Dashboard focused on classroom management. Each classroom is a card showing name, number of students, and quick action buttons. Inviting, clear layout.
        *   *Interaction Pattern:* Navigation links, card clicks.

    *   **Step 2: Create/Manage Classroom**
        *   *User Action:* Clicks "Create New Classroom" or selects an existing classroom to manage.
        *   *System Response:* Provides an interface for setting classroom name, generating/revoking a unique join code, and managing student roster.
        *   *Wireframe/UI Description:* Classroom settings page: "Classroom Name" input. "Generate New Code" button displays the code clearly. A list of enrolled students with options to remove them. "Share Deck" button to assign decks to the class.
        *   *Interaction Pattern:* Form input, button clicks for code generation. Dynamic student list.
        *   *Security/Privacy:* Classroom names are public. Join codes are unique and non-guessable. Student memberships are tied pseudonymously (Kenmei username) to the classroom. No PII is revealed or stored.

    *   **Step 3: Track Student Study Activity**
        *   *User Action:* Selects a classroom and navigates to the "Student Progress" tab.
        *   *System Response:* Displays a list of students in the classroom with their "Time Spent Studying" (accumulated over time).
        *   *Wireframe/UI Description:* A table or list view of students. Each row displays the student's Kenmei username and their total accumulated study time. Simple sorting/filtering options may be present.
        *   *Interaction Pattern:* Table view, basic sorting.
        *   *Security/Privacy:* Only "Time Spent Studying" (a non-PII metric) is displayed. No grades, disciplinary records, or other sensitive educational records are tracked or shown. Student data is accessed via RBAC; teachers can only see data for students explicitly in their classrooms. All access is logged for auditing, ensuring accountability.

*   **Postconditions:** Classroom created/managed, student study activity monitored.

**2.6. Administrator: Manage District & Accounts**

*   **Goal:** Oversee district affiliation requests and manage teacher/student accounts within their district.
*   **Actors:** Administrator.
*   **Preconditions:** Administrator is logged in.
*   **Triggers:** Administrator navigates to "District Management" or "Account Approvals."

*   **Flow:**
    *   **Step 1: Administrator Dashboard / Overview**
        *   *User Action:* Views the administrator dashboard, showing pending district affiliation requests and quick links to teacher/student account management.
        *   *System Response:* Displays a summary of pending requests and overall system health (if applicable).
        *   *Wireframe/UI Description:* Administrator dashboard is simple, primarily showing counts of pending requests and links to more detailed management pages. Focus on functionality over aesthetics for this role.
        *   *Interaction Pattern:* Navigation links, numerical summaries.

    *   **Step 2: Approve District Affiliation Requests**
        *   *User Action:* Clicks on "Pending District Requests." Reviews a list of Kenmei usernames requesting affiliation with their district.
        *   *System Response:* Presents a list of requests. Each request shows the Kenmei username. Provides "Approve" and "Deny" options.
        *   *Wireframe/UI Description:* A table or list showing pending requests. Each row has the requesting username and two buttons: "Approve" and "Deny." Confirmation pop-ups for actions.
        *   *Interaction Pattern:* List review, button clicks, confirmation modals.
        *   *Security/Privacy:* Only Kenmei usernames are displayed. No PII is involved in the approval process. Administrator actions are extensively audited and logged to ensure accountability and compliance with Ohio SB 29. Multi-factor authentication is required for such sensitive actions.

    *   **Step 3: Executive Access to Teacher/Student Accounts (Read-Only for now)**
        *   *User Action:* Navigates to "Manage Teachers" or "Manage Students." Selects an account for review.
        *   *System Response:* Displays a list of accounts within their affiliated district. Upon selection, displays basic, permitted account details (e.g., Kenmei username, account creation date, classroom membership).
        *   *Wireframe/UI Description:* A browsable list/table of teacher or student accounts. Selecting an account opens a read-only detail view with non-PII information.
        *   *Interaction Pattern:* List browsing, click to view details.
        *   *Security/Privacy:* "Executive Access" means the ability to view *permitted* (non-PII) account details and their associated activities (e.g., student's study time, teacher's classroom list). No PII (full names, emails, etc.) is ever displayed or accessible. All access is strictly role-based and auditable. Data is encrypted at rest (AES-256) and in transit (TLS 1.3). Row-level security policies (Supabase) ensure that an administrator can only view accounts within their *approved* district.

*   **Postconditions:** District affiliations managed, account oversight maintained within security protocols.

## Styling Guidelines
STYLING GUIDELINES

Kenmai is an educational platform designed to be inviting, simple, and wise, drawing inspiration from Japanese aesthetics, particularly sakura (cherry blossom) imagery. Our styling principles are rooted in clarity, user-friendliness for K-12 students, and a sense of calm, focused learning.

1.  DESIGN PHILOSOPHY & UI/UX PRINCIPLES
    *   **Simplicity & Clarity:** The interface will be clean and uncluttered, prioritizing ease of use and comprehension for all users, especially K-12 students. Information will be presented in a straightforward, digestible manner.
    *   **Inviting & Warm:** While maintaining simplicity, the design will foster a welcoming and encouraging atmosphere. Soft colors and approachable typography will contribute to a positive learning environment.
    *   **Wisdom & Serenity:** Reflecting the "Kenmai" name (Japanese for wisdom), the aesthetic will embody a sense of calm, focus, and quiet intelligence. This influences color choices, typography, and the overall minimalist approach.
    *   **Intuitive Navigation:** Users should easily understand how to move through the platform, access features, and complete tasks. Consistent navigation patterns and clear visual cues will be employed.
    *   **Engagement & Motivation:** For games and study progress, visual elements will be designed to be engaging and motivating without being overwhelming or distracting. Leaderboards, while optional for display, will visually communicate progress clearly.
    *   **Accessibility:** Design choices will consider WCAG guidelines to ensure the platform is usable by individuals with diverse needs. This includes sufficient color contrast, legible font sizes, and clear interactive elements.
    *   **Security & Trust:** The visual design will convey trustworthiness and professionalism, subtly reinforcing the platform's commitment to user data privacy and security (Ohio SB 29 compliance). This means avoiding overly flashy or chaotic designs that could undermine a sense of reliability.
    *   **Consistency:** A unified visual language across all pages, components, and user roles (student, teacher, administrator) will ensure a cohesive and predictable user experience.

2.  COLOR PALETTE
    The color palette is inspired by Japanese aesthetics, particularly the soft, inviting tones of sakura (cherry blossoms), combined with grounding neutrals and subtle accents to convey wisdom and focus.

    *   **Primary Colors:**
        *   **Sakura Pink (Main Accent):** #F8C3D3 (Soft, inviting, represents growth and new beginnings)
        *   **Gentle White (Background/Canvas):** #FDFBF8 (Clean, spacious, allows content to breathe)

    *   **Secondary Colors:**
        *   **Calm Sage Green (Accent/Interactive):** #A8D8C2 (Nurturing, represents learning and growth, subtle contrast)
        *   **Muted Indigo (Text/Headings):** #3A4F6B (Deep, wise, provides good contrast for readability)

    *   **Neutral Colors:**
        *   **Light Grey:** #E0E0E0 (Dividers, subtle backgrounds)
        *   **Medium Grey:** #8C8C8C (Secondary text, inactive states)
        *   **Dark Grey:** #333333 (Primary text, strong contrast)

    *   **Semantic Colors:**
        *   **Success:** #6FC08E (Green for correct answers, positive feedback)
        *   **Error/Warning:** #E05C6B (Soft Red for incorrect answers, important alerts)
        *   **Information/Hint:** #7DA0C9 (Light Blue for hints, informational messages)

3.  TYPOGRAPHY
    Typography will prioritize readability and clarity for a K-12 audience while maintaining a clean, modern, and slightly serene feel.

    *   **Font Family:**
        *   **Headings:** "Montserrat" (or similar clear, geometric sans-serif for headings, offering a modern yet approachable feel).
        *   **Body Text:** "Open Sans" (or similar highly legible, humanist sans-serif for all body text, ensuring readability across various screen sizes and long-form content like study guides).

    *   **Font Sizing (Desktop Base - Adjustments for Mobile):**
        *   **H1 (Page Titles):** 36px
        *   **H2 (Section Titles):** 28px
        *   **H3 (Sub-sections/Card Titles):** 22px
        *   **H4 (Minor Headings):** 18px
        *   **Body Text:** 16px
        *   **Small Text/Captions:** 14px
        *   **Button Text:** 16px

    *   **Line Height:** Approximately 1.5 times the font size for body text to improve readability.
    *   **Letter Spacing:** Standard or slightly tighter tracking for body text; minor adjustments for headings if aesthetically necessary.
    *   **Weight:** Use of Regular, Semi-Bold, and Bold weights will provide visual hierarchy without clutter.

4.  ICONOGRAPHY
    Icons will be simple, clean, and easily recognizable, maintaining a consistent minimalist line-art style.

    *   **Style:** Outline or subtly filled icons, consistent stroke weight.
    *   **Clarity:** Icons should clearly represent their function without ambiguity.
    *   **Simplicity:** Avoid overly detailed or ornate icons.
    *   **Usage:** Used to reinforce navigation, illustrate features, and provide visual cues (e.g., flashcard flip, game modes, AI generation).

5.  UI COMPONENTS & ELEMENTS
    All UI components will adhere to a consistent design language to ensure a seamless user experience.

    *   **Buttons:**
        *   **Primary:** Sakura Pink background, white text. Used for main actions (e.g., "Create Flashcard," "Start Study Session").
        *   **Secondary:** Outline with Sakura Pink border, Sakura Pink text. Used for less prominent actions (e.g., "Edit Profile," "View All").
        *   **Tertiary/Ghost:** Transparent background, Muted Indigo text. Used for low-emphasis actions or navigation.
        *   **States:** Clear hover, active, focused, and disabled states will be defined.

    *   **Forms & Inputs:**
        *   **Text Fields:** Clean, rectangular inputs with subtle borders and ample padding. Labels will be clearly visible above or to the left of the input field.
        *   **Placeholders:** Light grey text providing helpful hints.
        *   **Error States:** Inputs will highlight in soft red with accompanying error messages.
        *   **Checkboxes/Radio Buttons:** Simple, custom-styled to match the overall aesthetic.
        *   **Dropdowns:** Clean and consistent with text fields.

    *   **Flashcards:**
        *   **Design:** Clean, minimalist cards with plenty of white space. Distinct visual cues for front and back.
        *   **Text/Image Display:** Clear typography for text; images will be displayed prominently within defined bounds.
        *   **Flipping Animation:** Smooth, subtle 3D-like flip animation to indicate transition between front and back.
        *   **Feedback:** Visual indicators for correct/incorrect answers (e.g., subtle color overlay or checkmark/cross icon).

    *   **Game Elements:**
        *   **Scoring:** Clearly displayed points, multipliers, and streaks using a distinct, easy-to-read font.
        *   **Leaderboards:** Clean tabular or list layout. Student names will be anonymized by default or display only usernames/avatars. Score comparison will be visually prominent.
        *   **Timers/Progress Bars:** Simple, visually intuitive indicators of time remaining or progress toward a goal.

    *   **Navigation:**
        *   **Header:** Clean, minimalist header containing logo, main navigation links, and user profile/account access.
        *   **Sidebar (if applicable):** Structured for easy access to different sections (e.g., "My Decks," "Games," "AI Study"). Clear active state for the current page.
        *   **Breadcrumbs:** For complex flows, simple text breadcrumbs will provide navigational context.

    *   **Modals & Dialogs:**
        *   Consistent styling with a semi-transparent overlay and a centrally positioned, clean white or light-colored container.
        *   Clear titles, concise messages, and explicit action buttons.

    *   **Data Visualization (Study Time):**
        *   Simple charts (e.g., bar graphs, line graphs) to display study time over periods. Focus on clarity and ease of interpretation for teachers.
        *   Colors will align with the defined palette.

    *   **AI Integration UI:**
        *   AI-generated content (study guides, practice tests) will be presented in clearly defined sections, possibly with a subtle background color or border to distinguish it from user-generated content.
        *   Interactive questions will have clear input fields and immediate feedback mechanisms.

6.  IMAGERY & ILLUSTRATIONS
    Imagery will be used sparingly and purposefully, focusing on high-quality, relevant visuals that support the educational context and aesthetic.

    *   **Style:** Minimalist, serene, and clean. Potentially incorporating subtle, abstract Japanese motifs (e.g., stylized cherry blossoms, gentle waves) in background elements or decorative accents.
    *   **Content:** Focus on abstract concepts related to learning, growth, and wisdom. Avoid complex or distracting images.
    *   **Photography:** If used, photography should be high-quality, softly lit, and relatable to an academic or serene setting, avoiding stock photo clichés.

7.  SPACING & LAYOUT
    Consistent use of white space is fundamental to achieving simplicity, clarity, and a serene aesthetic.

    *   **Grids:** A responsive grid system will be implemented to ensure consistent alignment and spacing across different screen sizes.
    *   **Padding & Margins:** Standardized spacing units (e.g., 8px increments) will be applied consistently for padding within components and margins between them.
    *   **Content Density:** Prioritize ample white space around content blocks to reduce cognitive load and enhance readability.

8.  ANIMATIONS & TRANSITIONS
    Animations will be subtle, purposeful, and enhance the user experience without being distracting or slowing down interactions.

    *   **Purpose:** Provide visual feedback, indicate state changes, or guide the user's attention.
    *   **Speed:** Quick and fluid (e.g., 0.15s - 0.3s duration).
    *   **Examples:** Flashcard flipping, button hover/active states, smooth transitions between pages or content sections, progress bar updates.
