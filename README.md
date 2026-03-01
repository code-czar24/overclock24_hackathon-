# MedGraph – Drug Interaction Checker

A simple web-based Drug Interaction Checker that helps users find possible interactions between medicines using a MongoDB database.

--------------------------------------------------

## 1. Problem Statement

### Problem Title
Drug Interaction Checker

### Problem Description
Many patients take multiple medicines at the same time. Some medicines should not be taken together because they can cause harmful effects.

Doctors and students often need a quick way to check medicine interactions. This project provides a simple tool where users can enter medicine names and check if any interactions exist.

The system:
- Takes a list of medicines as input
- Checks for interactions
- Shows severity levels
- Displays interaction descriptions

### Target Users
- Students
- Doctors
- Pharmacists
- Anyone wanting to check medicine interactions

### Existing Gaps
- Hard to quickly check interactions
- Manual searching takes time
- No simple tools for quick checking

--------------------------------------------------

## 2. Problem Understanding & Approach

### Problem
- People take multiple medicines
- Some medicines interact with each other
- Interactions can be harmful
- Checking manually is slow

### Approach
- Store medicine interaction data in MongoDB
- Take medicine names as input
- Check interactions in database
- Display results

--------------------------------------------------

## 3. Proposed Solution

### Solution Overview
MedGraph checks medicine interactions using a simple database.

### Core Idea
- User enters medicine names
- System checks MongoDB
- If interaction exists, it is displayed

### Key Features
- Medicine input
- Interaction checking
- Severity display
- Simple interface

--------------------------------------------------

## 4. System Architecture

### High-Level Flow
User → Frontend → Server → MongoDB → Results

### Description
1. User enters medicine names
2. Data is sent using JavaScript
3. Server checks MongoDB
3. Results are returned
5. Results are displayed

--------------------------------------------------

## 5. Database Design

### Collections
Drug Interaction Collection:

Fields:
- drug1
- drug2
- severity
- description

Example:

{
  "drug1": "Paracetamol",
  "drug2": "Ibuprofen",
  "severity": "Low",
  "description": "Safe in normal doses"
}

--------------------------------------------------

## 6. Dataset Selected

### Dataset Name
Drug Interaction Data

### Data Type
- Drug names
- Drug pairs
- Severity
- Description

### Reason
- Easy to store
- Easy to check
- Simple structure

--------------------------------------------------

## 7. Technology Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- JavaScript

### Database
- MongoDB

--------------------------------------------------

## 8. API

### Check Interactions

POST /check

Request:

{
  "drugs": ["Paracetamol", "Ibuprofen"]
}

Response:

{
  "interactions": [
    {
      "drug1": "Paracetamol",
      "drug2": "Ibuprofen",
      "severity": "Low",
      "description": "Safe in normal doses"
    }
  ]
}

--------------------------------------------------

## 9. Project Structure

MedGraph \
│── index.html \
│── style.css \
│── script.js \
│── server.js \
│── README.md

--------------------------------------------------

## 10. Workflow

1. Enter medicines
2. Send data
3. Check database
4. Show results

--------------------------------------------------

## 11. Demo

Live Demo: https://overclock24-hackathon.onrender.com/ \
Video Demo: https://drive.google.com/file/d/1TD5-vnW5o5QfQaGROY64iXTZOxgB93as/view?usp=sharing \
GitHub Repo: https://github.com/code-czar24/overclock24_hackathon-.git 

--------------------------------------------------

## 12. Team

Vinayak Giregol – Developer \
Sonu Choudhary – Research \
Akash Kumar – Testing 

--------------------------------------------------

## 13. Future Scope

- Add more medicines
- Improve design
- Faster search

--------------------------------------------------

## 14. Limitations

- Limited data
- Basic checking
- Not a medical tool

--------------------------------------------------

## 15. Impact

- Helps check interactions
- Saves time
- Easy to use
