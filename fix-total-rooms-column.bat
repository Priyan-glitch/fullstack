@echo off
echo Adding total_rooms column to hostels table...

docker exec stable-roomies-postgres-hostel psql -U postgres -d hostel_db -c "ALTER TABLE hostels ADD COLUMN IF NOT EXISTS total_rooms INTEGER;"

docker exec stable-roomies-postgres-hostel psql -U postgres -d hostel_db -c "UPDATE hostels SET total_rooms = 100 WHERE total_rooms IS NULL;"

docker exec stable-roomies-postgres-hostel psql -U postgres -d hostel_db -c "ALTER TABLE hostels ALTER COLUMN total_rooms SET NOT NULL;"

docker exec stable-roomies-postgres-hostel psql -U postgres -d hostel_db -c "ALTER TABLE hostels ALTER COLUMN total_rooms SET DEFAULT 0;"

echo.
echo Migration completed! Please restart the hostel-service.
echo.
pause
