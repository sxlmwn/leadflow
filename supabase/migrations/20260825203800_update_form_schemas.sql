-- Update form_schema for WindowHound
update brands
set form_schema = '{
  "title": "Get Your Free Window Replacement Quote",
  "description": "Complete this 30-second form to compare quotes from top licensed window specialists.",
  "steps": [
    {
      "step_id": "project_info",
      "title": "Project Details",
      "fields": [
        {
          "name": "project_type",
          "label": "What is the scope of your window project?",
          "type": "radio",
          "required": true,
          "options": [
            { "label": "Replace Existing Windows", "value": "replace" },
            { "label": "Install Windows in New Construction", "value": "new_installation" },
            { "label": "Repair Damaged Windows", "value": "repair" }
          ]
        },
        {
          "name": "number_of_windows",
          "label": "How many windows need replacement or repair?",
          "type": "select",
          "required": true,
          "options": [
            { "label": "1 - 2 Windows", "value": "1-2" },
            { "label": "3 - 5 Windows", "value": "3-5" },
            { "label": "6 - 10 Windows", "value": "6-10" },
            { "label": "10+ Windows", "value": "10+" }
          ]
        },
        {
          "name": "home_ownership",
          "label": "Do you own the home?",
          "type": "radio",
          "required": true,
          "options": [
            { "label": "Yes, I am the homeowner", "value": "own" },
            { "label": "No, I am a renter", "value": "rent" }
          ]
        }
      ]
    },
    {
      "step_id": "contact_info",
      "title": "Where should we send your estimates?",
      "fields": [
        {
          "name": "full_name",
          "label": "Full Name",
          "type": "text",
          "placeholder": "e.g. Jane Smith",
          "required": true
        },
        {
          "name": "email",
          "label": "Email Address",
          "type": "email",
          "placeholder": "jane@example.com",
          "required": true
        },
        {
          "name": "phone",
          "label": "Phone Number",
          "type": "phone",
          "placeholder": "(555) 234-5678",
          "required": true
        },
        {
          "name": "zip_code",
          "label": "ZIP Code",
          "type": "zip_code",
          "placeholder": "90210",
          "required": true
        }
      ]
    }
  ]
}'::jsonb
where slug = 'windowhound';

-- Update form_schema for MedTrialMatch
update brands
set form_schema = '{
  "title": "Check Eligibility for Paid Clinical Studies",
  "description": "Find medical trials matching your condition and earn compensation for your participation.",
  "steps": [
    {
      "step_id": "trial_info",
      "title": "Medical Study Interest",
      "fields": [
        {
          "name": "condition_type",
          "label": "Select medical condition or area of interest:",
          "type": "select",
          "required": true,
          "options": [
            { "label": "Diabetes & Endocrine Studies", "value": "diabetes" },
            { "label": "Asthma & Respiratory Trials", "value": "asthma" },
            { "label": "Chronic Pain & Joint Health", "value": "chronic_pain" },
            { "label": "Cardiovascular & Heart Health", "value": "cardio" },
            { "label": "Healthy Volunteer Trials", "value": "healthy_volunteer" }
          ]
        },
        {
          "name": "age_group",
          "label": "What is your age group?",
          "type": "radio",
          "required": true,
          "options": [
            { "label": "18 - 34 years", "value": "18-34" },
            { "label": "35 - 54 years", "value": "35-54" },
            { "label": "55+ years", "value": "55plus" }
          ]
        },
        {
          "name": "has_insurance",
          "label": "Do you currently have medical insurance?",
          "type": "radio",
          "required": false,
          "options": [
            { "label": "Yes", "value": "yes" },
            { "label": "No", "value": "no" }
          ]
        }
      ]
    },
    {
      "step_id": "contact_info",
      "title": "Trial Coordinator Contact Details",
      "fields": [
        {
          "name": "full_name",
          "label": "Full Legal Name",
          "type": "text",
          "placeholder": "e.g. Robert Johnson",
          "required": true
        },
        {
          "name": "email",
          "label": "Email Address",
          "type": "email",
          "placeholder": "robert@example.com",
          "required": true
        },
        {
          "name": "phone",
          "label": "Mobile Phone",
          "type": "phone",
          "placeholder": "(555) 987-6543",
          "required": true
        },
        {
          "name": "zip_code",
          "label": "ZIP Code",
          "type": "zip_code",
          "placeholder": "10001",
          "required": true
        }
      ]
    }
  ]
}'::jsonb
where slug = 'medtrialmatch';

-- Update form_schema for ReliefOlogist
update brands
set form_schema = '{
  "title": "Get Customized Pain Relief Guidance",
  "description": "Tell us about your pain symptoms to receive tailored product samples & expert advice.",
  "steps": [
    {
      "step_id": "symptom_info",
      "title": "Symptom Assessment",
      "fields": [
        {
          "name": "pain_area",
          "label": "Where do you experience discomfort most often?",
          "type": "select",
          "required": true,
          "options": [
            { "label": "Lower Back & Spine", "value": "lower_back" },
            { "label": "Knees & Joint Joints", "value": "knees_joints" },
            { "label": "Neck & Shoulders", "value": "neck_shoulders" },
            { "label": "Sciatica & Nerve Pain", "value": "sciatica" }
          ]
        },
        {
          "name": "pain_duration",
          "label": "How long have you had this discomfort?",
          "type": "radio",
          "required": true,
          "options": [
            { "label": "Less than 1 month", "value": "acute" },
            { "label": "1 to 6 months", "value": "moderate" },
            { "label": "6+ months (Chronic)", "value": "chronic" }
          ]
        },
        {
          "name": "tried_remedies",
          "label": "What solutions have you tried?",
          "type": "checkbox",
          "required": false,
          "options": [
            { "label": "Over-the-counter pain relievers", "value": "otc" },
            { "label": "Physical therapy", "value": "pt" },
            { "label": "Topical creams or gels", "value": "creams" },
            { "label": "Natural / Herbal supplements", "value": "herbal" }
          ]
        }
      ]
    },
    {
      "step_id": "contact_info",
      "title": "Where should we send your sample kit?",
      "fields": [
        {
          "name": "full_name",
          "label": "Full Name",
          "type": "text",
          "placeholder": "e.g. Alex Miller",
          "required": true
        },
        {
          "name": "email",
          "label": "Email Address",
          "type": "email",
          "placeholder": "alex@example.com",
          "required": true
        },
        {
          "name": "phone",
          "label": "Phone Number",
          "type": "phone",
          "placeholder": "(555) 456-7890",
          "required": true
        },
        {
          "name": "zip_code",
          "label": "ZIP Code",
          "type": "zip_code",
          "placeholder": "60601",
          "required": true
        }
      ]
    }
  ]
}'::jsonb
where slug = 'reliefologist';
