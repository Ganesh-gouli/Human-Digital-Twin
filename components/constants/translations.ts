export const TRANSLATIONS: Record<string, any> = {
    'English': {
        hello: "Hello",
        subtitle: "Your daily health command center.",
        language: "Language",
        daily_insight: "Daily Insight",
        generating: "Generating...",
        todays_intake: "Today's Intake",
        goal: "Goal",
        burned: "Burned",
        net: "Net",
        bmi_status: "BMI Status",
        consumed: "Consumed",
        no_intake: "No intake logged",
        todays_target: "Today's Target",
        planned: "Planned",
        total_planned: "Total Planned Calories",
        planned_meals: "Planned Meals",
        no_meals: "No meals planned",
        activity_trends: "Activity Trends",
        intake: "Intake",
        of_daily_goal: "of daily goal",
        bmi_status_underweight: "Underweight",
        bmi_status_normal: "Normal",
        bmi_status_overweight: "Overweight",
        bmi_status_obese: "Obese",
        explore: "Explore",
        layout: {
            dashboard: "Dashboard",
            back_to_dashboard: "Back to Dashboard",
            edit_profile: "Edit Profile",
            sign_out: "Sign Out",
            app_title: "Health Hub AI",
            toggle_dark_mode: "Toggle dark mode",
            toggle_ai_assistant: "Toggle AI Assistant"
        },
        features: {
            diet_plan: { title: "Diet Plan", desc: "AI-crafted meal plans tailored to your metabolism." },
            report_analyzer: { title: "Report Analyzer", desc: "Decode medical jargon into simple insights." },
            calorie_counter: { title: "Calorie Counter", desc: "Snap a photo to track your daily intake." },
            exercise_corner: { title: "Exercise Corner", desc: "Workouts designed for your specific goals." },
            todays_goal: { title: "Today's Goal", desc: "Monitor your progress and daily limits." },
            health_services: { title: "Health Services", desc: "Locate top-rated care near you." }
        }
    },
    'Hindi': {
        hello: "नमस्ते",
        subtitle: "आपका दैनिक स्वास्थ्य कमांड सेंटर।",
        language: "भाषा",
        daily_insight: "दैनिक जानकारी",
        generating: "उत्पन्न हो रहा है...",
        todays_intake: "आज का आहार",
        goal: "लक्ष्य",
        burned: "जलाया",
        net: "नेट",
        bmi_status: "बीएमआई स्थिति",
        consumed: "उपभोग किया",
        no_intake: "कोई आहार दर्ज नहीं",
        todays_target: "आज का लक्ष्य",
        planned: "नियोजित",
        total_planned: "कुल नियोजित कैलोरी",
        planned_meals: "नियोजित भोजन",
        no_meals: "कोई भोजन नियोजित नहीं",
        activity_trends: "गतिविधि रुझान",
        intake: "आहार",
        of_daily_goal: "दैनिक लक्ष्य का",
        bmi_status_underweight: "कम वजन",
        bmi_status_normal: "सामान्य",
        bmi_status_overweight: "अधिक वजन",
        bmi_status_obese: "मोटापा",
        explore: "खोजें",
        layout: {
            dashboard: "डैशबोर्ड",
            back_to_dashboard: "डैशबोर्ड पर वापस जाएं",
            edit_profile: "प्रोफ़ाइल संपादित करें",
            sign_out: "साइन आउट",
            app_title: "हेल्थ हब एआई",
            toggle_dark_mode: "डार्क मोड टॉगल करें",
            toggle_ai_assistant: "एआई असिस्टेंट टॉगल करें"
        },
        features: {
            diet_plan: { title: "आहार योजना", desc: "आपके चयापचय के लिए एआई-निर्मित भोजन योजनाएं।" },
            report_analyzer: { title: "रिपोर्ट विश्लेषक", desc: "चिकित्सा शब्दजाल को सरल अंतर्दृष्टि में बदलें।" },
            calorie_counter: { title: "कैलोरी काउंटर", desc: "अपने दैनिक सेवन को ट्रैक करने के लिए फोटो लें।" },
            exercise_corner: { title: "व्यायाम कॉर्नर", desc: "आपके विशिष्ट लक्ष्यों के लिए डिज़ाइन किए गए व्यायाम।" },
            todays_goal: { title: "आज का लक्ष्य", desc: "अपनी प्रगति और दैनिक सीमाओं की निगरानी करें।" },
            health_services: { title: "स्वास्थ्य सेवाएं", desc: "अपने पास की टॉप-रेटेड देखभाल खोजें।" }
        }
    }
};

// Fallback for other languages to English for now, can be expanded later
['Kannada', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati'].forEach(lang => {
    TRANSLATIONS[lang] = TRANSLATIONS['English'];
});
