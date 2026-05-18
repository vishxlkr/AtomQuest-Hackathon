#!/bin/bash

cmd.exe /c start cmd /k "cd backend && npm run dev"
cmd.exe /c start cmd /k "cd employee-portal && npm run dev -- --port 3000"
cmd.exe /c start cmd /k "cd admin-portal && npm run dev -- --port 3001"