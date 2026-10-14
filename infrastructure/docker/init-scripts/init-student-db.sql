-- student_db is created by the container entrypoint from POSTGRES_DB *before*
-- the init scripts run. Re-issuing CREATE DATABASE here fails with
-- "database already exists", and because the entrypoint runs init scripts with
-- ON_ERROR_STOP=1 the whole script aborts and the container exits with code 3 —
-- so postgres-student could never come up on a fresh volume.
--
-- Tables are created by Hibernate when student-service starts (ddl-auto), so
-- this script only needs to connect and re-assert the owner privileges.

\c student_db;

GRANT ALL PRIVILEGES ON DATABASE student_db TO postgres;
