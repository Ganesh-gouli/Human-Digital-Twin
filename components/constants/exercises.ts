import { CatalogExercise } from '../../types';

export const EXERCISE_CATALOG: CatalogExercise[] = [
    // User Requested Special Exercises
    { id: 'u1', name: 'Pike to Cobra Push-up', muscles: ['Chest', 'Shoulders', 'Core'], equipment: ['Bodyweight'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/_dd9chP58Lk?si=crM0ReMpCer07cIT' },
    { id: 'u2', name: 'Knuckle Push Up', muscles: ['Chest', 'Triceps'], equipment: ['Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/VDZnvD7AHGQ?si=4coAoVw3Wg_hKUla' },
    { id: 'u3', name: 'Plyometric Press Ups', muscles: ['Chest', 'Triceps', 'Cardio'], equipment: ['Bodyweight'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/D6lNvOYDkYw?si=OL7pk6wujcyiNp0x' },
    { id: 'u4', name: 'Bent Knee Hip Raises', muscles: ['Core', 'Glutes'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/aYevIWmK-b0?si=L3OrOE-9UqkSyfRC' },
    { id: 'u5', name: 'Toe Touches', muscles: ['Core'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/Dw_qra5MK4s?si=sRbCUa4QV7dKnNhP' },
    { id: 'u6', name: 'Scissor Kicks', muscles: ['Core'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/JUKzC4WlWWQ?si=uKKpudbHNgvuGYrM' },

    // Batch 2 Requests
    { id: 'u7', name: 'Kneeling One Side Archer Push-up', muscles: ['Chest', 'Core', 'Shoulders'], equipment: ['Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/RU2cfX_904c' },
    { id: 'u8', name: 'Narrow Grip Press Ups (Knees)', muscles: ['Chest', 'Triceps'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/5zzejEZDNOc' },
    { id: 'u9', name: 'Bicycle Twisting Crunch', muscles: ['Core'], equipment: ['Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/f-FOyvuGSPM' },

    // Batch 3 Requests (Shoulders, Biceps, Forearms)
    { id: 'u10', name: 'Negative Biceps Leg Concentration Curl', muscles: ['Biceps'], equipment: ['Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/NaDaPblyqak' },
    { id: 'u11', name: 'Arm Circles', muscles: ['Shoulders'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/ib1MxRUIOXU' },
    { id: 'u12', name: 'Decline Diamond Pike Push Up', muscles: ['Shoulders', 'Triceps', 'Chest'], equipment: ['Bodyweight', 'Bench'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/Gj00t1R6OYI' },
    { id: 'u13', name: 'Handstand Push-Ups', muscles: ['Shoulders', 'Triceps'], equipment: ['Bodyweight'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/87xuYj86-yY' },
    { id: 'u14', name: 'Kneeling Fist Roll', muscles: ['Forearms'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/OV6PEuc0fsM' },
    { id: 'u15', name: 'Wrist Circles', muscles: ['Forearms'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/-51CNL7Ldo8' },
    { id: 'u16', name: 'Kneeling Finger Press', muscles: ['Forearms'], equipment: ['Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/T8Oqfe8pC-w' },

    // Batch 4 Requests (Quads, Calves, Hamstrings)
    { id: 'u17', name: 'Kneeling Squats', muscles: ['Quads', 'Glutes'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/dIL09dr71Ho' },
    { id: 'u18', name: 'Alternating Bodyweight Lunges', muscles: ['Quads', 'Glutes', 'Hamstrings'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/RZikBmrkXso' },
    { id: 'u19', name: 'Double Pulse Squat Kickback Plyometrics', muscles: ['Quads', 'Glutes', 'Cardio'], equipment: ['Bodyweight'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/sIH7uEH9cTM' },
    { id: 'u20', name: 'Good Morning Squat', muscles: ['Hamstrings', 'Glutes', 'Quads'], equipment: ['Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/US2w6-B3DDw' },
    { id: 'u21', name: 'Bodyweight Glute Kickbacks', muscles: ['Glutes', 'Hamstrings'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/WBlVR4_eES8' },
    { id: 'u22', name: 'Straight Leg Bodyweight Glute Kickbacks', muscles: ['Glutes', 'Hamstrings'], equipment: ['Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/tc0ldvYByLY' },
    { id: 'u23', name: 'Quick Mini Jumps', muscles: ['Calves', 'Cardio'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/WWRsShePVTU' },
    { id: 'u24', name: 'Rocking Standing Calf Raise', muscles: ['Calves'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/HV7dsnvSpY8' },

    // Batch 5 Requests (Dumbbell - Chest & Core)
    { id: 'u25', name: 'Decline Dumbbell Chest Press', muscles: ['Chest', 'Triceps'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/rgS8gp7qo1I' },
    { id: 'u26', name: 'Flat Dumbbell Chest Press', muscles: ['Chest', 'Triceps'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/FymkWalUino' },
    { id: 'u27', name: 'Dumbbell Incline Palm-in Press', muscles: ['Chest', 'Triceps'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/yte83izCaJ8' },
    { id: 'u28', name: 'Dumbbell Seated Tuck Twisting Crunch', muscles: ['Core'], equipment: ['Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/CrkoCEDKNI0' },
    { id: 'u29', name: 'Otis Ups', muscles: ['Core'], equipment: ['Dumbbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/HO9cFagYKEI' },
    { id: 'u30', name: 'Dumbbell Side Bends', muscles: ['Core'], equipment: ['Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/alpxMnyXRQo' },
    { id: 'u31', name: 'V Sit Rotation', muscles: ['Core'], equipment: ['Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/pxhWwhilRjY' },

    // Batch 6 Requests (Dumbbell - Shoulders, Biceps, Forearms, Triceps)
    { id: 'u32', name: 'Side Laterals to Front Raise', muscles: ['Shoulders'], equipment: ['Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/HOg0Hplvrjs' },
    { id: 'u33', name: 'Dumbbell Clean & Press', muscles: ['Shoulders', 'Triceps'], equipment: ['Dumbbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/Es8yKtMHwP8' },
    { id: 'u34', name: 'Single Arm Standing Shoulder Press', muscles: ['Shoulders', 'Triceps'], equipment: ['Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/c-AhcJp4Ub8' },
    { id: 'u35', name: 'Single Spider Curl (Chest Support)', muscles: ['Biceps'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/pf3ymQOb1rk' },
    { id: 'u36', name: 'Standing Alternate Rotating Bicep Curls', muscles: ['Biceps'], equipment: ['Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/1hYzDB7E04I' },
    { id: 'u37', name: 'Seated Hammer Curls', muscles: ['Biceps'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/jDGXcqfUjY8' },
    { id: 'u38', name: 'Dumbbell Finger Curls', muscles: ['Forearms'], equipment: ['Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/NOcgbF_8dEk' },
    { id: 'u39', name: 'Dumbbell Lying Pronation', muscles: ['Forearms'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/29VeC4Twbg0' },
    { id: 'u40', name: 'Single Arm Wrist Curls (Bench)', muscles: ['Forearms'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/eUlJfIJUbzs' },
    { id: 'u41', name: 'One Arm Supinated Triceps Extension', muscles: ['Triceps'], equipment: ['Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/iaX_XnnRWKU' },
    { id: 'u42', name: 'Tate Press', muscles: ['Triceps', 'Chest'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/dTs_jl4Isls' },
    { id: 'u43', name: 'Kneeling Tricep Kickbacks', muscles: ['Triceps'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/i__ebQzDgmI' },

    // Batch 7 Requests (Dumbbell - Legs)
    { id: 'u44', name: 'Alternating Reverse Dumbbell Lunges (Step)', muscles: ['Quads', 'Glutes', 'Hamstrings'], equipment: ['Dumbbell', 'Box'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/T4-8B8QqM2k' },
    { id: 'u45', name: 'High Grip Dumbbell Squats', muscles: ['Quads', 'Glutes'], equipment: ['Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/oiqjQuMpG7c' },
    { id: 'u46', name: 'Static Dumbbell Lunges', muscles: ['Quads', 'Glutes', 'Hamstrings'], equipment: ['Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/v7x6BOdwpaQ' },
    { id: 'u47', name: 'Dumbbell Calf Raises', muscles: ['Calves'], equipment: ['Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/Svu0XshosnQ' },
    { id: 'u48', name: 'Single Leg Seated Calf Raises', muscles: ['Calves'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/BmPtVqmahjA' },
    { id: 'u49', name: 'Single-Leg Standing Calf Raise', muscles: ['Calves'], equipment: ['Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/FkH6JbygoAU' },
    { id: 'u50', name: 'Dumbbell Sumo Squat (Stability Ball)', muscles: ['Quads', 'Glutes'], equipment: ['Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/I4iflDKlqSo' },
    { id: 'u51', name: 'Single Leg Dumbbell Deadlifts', muscles: ['Hamstrings', 'Glutes', 'Back'], equipment: ['Dumbbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/sAjnIe18w3Q' },
    { id: 'u52', name: 'Dumbbell Romanian Deadlifts', muscles: ['Hamstrings', 'Glutes', 'Back'], equipment: ['Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/tSB4osdMYZw' },

    // Batch 8 Requests (Bodyweight - Back)
    { id: 'u53', name: 'Reverse Plank on Elbows', muscles: ['Back', 'Core', 'Shoulders'], equipment: ['Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/eFeK4I-7D90' },
    { id: 'u54', name: 'Reverse Plank', muscles: ['Back', 'Core', 'Shoulders'], equipment: ['Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/LQvO1lxzzuA' },
    { id: 'u55', name: 'Lying Prone T Back', muscles: ['Back', 'Shoulders'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/-WwauLd3S8k' },
    { id: 'u56', name: 'Bodyweight Shrug', muscles: ['Back', 'Shoulders'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/2lvSjss4VfE' },
    { id: 'u57', name: 'Scapular Slide Back to Wall', muscles: ['Back', 'Shoulders'], equipment: ['Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/AYQO9mOH7xs' },

    // Batch 9 Requests (Dumbbell - Back)
    { id: 'u58', name: 'Dumbbell Pullover (Swiss Ball)', muscles: ['Back', 'Chest', 'Lats'], equipment: ['Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/Up9oycd2R4E' },
    { id: 'u59', name: 'Dumbbell Hammer Grip Incline Row', muscles: ['Back', 'Biceps'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/eCqJzqmvKaY' },
    { id: 'u60', name: 'Single Arm Hang Cleans', muscles: ['Back', 'Shoulders', 'Full Body'], equipment: ['Dumbbell', 'Kettlebell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/9rMhFZzp5o8' },
    { id: 'u61', name: 'Dumbbell Seated Gittleson Shrug', muscles: ['Back', 'Shoulders', 'Traps'], equipment: ['Dumbbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/JX1ugMBgi58' },
    { id: 'u62', name: 'Dumbbell Single Arm Shrug', muscles: ['Back', 'Shoulders', 'Traps'], equipment: ['Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/QIS9hZbJMe4' },
    { id: 'u63', name: 'Dumbbell Shrug', muscles: ['Back', 'Shoulders', 'Traps'], equipment: ['Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/XVF-1m99svA' },

    // Batch 10 Requests (Barbell - Chest, Core, Neck)
    { id: 'u64', name: 'Barbell Decline Bench Press', muscles: ['Chest', 'Triceps'], equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/msxFWcvV24w' },
    { id: 'u65', name: 'Narrow Grip Incline Bench Press', muscles: ['Chest', 'Triceps'], equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/z-tY3jEpPjg' },
    { id: 'u66', name: 'Pin Presses', muscles: ['Chest', 'Triceps'], equipment: ['Barbell', 'Bench'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/Vo6DJdkFHT0' },
    { id: 'u67', name: 'Barbell Roll-Out', muscles: ['Core'], equipment: ['Barbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/SRA0OSWivRM' },
    { id: 'u68', name: 'Landmine 180', muscles: ['Core'], equipment: ['Barbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/MF5g5gCjWsQ' },
    { id: 'u69', name: 'Barbell Press Sit-Ups', muscles: ['Core'], equipment: ['Barbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/FUj7COJRa48' },
    { id: 'u70', name: 'Standing Barbell Twist', muscles: ['Core'], equipment: ['Barbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/tCXgX9MuAhY' },
    { id: 'u71', name: 'Cable Shrugs', muscles: ['Neck', 'Back', 'Shoulders'], equipment: ['Barbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/Fqvx5YEOj4I' }, // Tagged Barbell per user request context
    { id: 'u72', name: 'Barbell Shrugs', muscles: ['Neck', 'Back', 'Shoulders'], equipment: ['Barbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/EBNB0kOR0vc' },
    { id: 'u73', name: 'Barbell Overhead Shrug', muscles: ['Neck', 'Back', 'Shoulders'], equipment: ['Barbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/rjmHGK-ElU8' },

    // Batch 11 Requests (Barbell - Shoulders, Biceps, Forearms, Triceps)
    { id: 'u74', name: 'Standing Barbell Shoulder Press', muscles: ['Shoulders', 'Triceps'], equipment: ['Barbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/u1iXpBkXIew' },
    { id: 'u75', name: 'Seated Barbell Shoulder Press (Behind Neck)', muscles: ['Shoulders', 'Triceps'], equipment: ['Barbell', 'Bench'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/oekpRqMzZoQ' },
    { id: 'u76', name: 'Seated Shoulder Press (Barbell)', muscles: ['Shoulders', 'Triceps'], equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/Sadx09VPulo' },
    { id: 'u77', name: 'Close-Grip Standing Barbell Curl', muscles: ['Biceps'], equipment: ['Barbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/ODzZn3glYMc' },
    { id: 'u78', name: 'Standing Barbell Curls', muscles: ['Biceps'], equipment: ['Barbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/xHNOnTSVSNg' },
    { id: 'u79', name: 'Reverse Grip Barbell Curls', muscles: ['Biceps', 'Forearms'], equipment: ['Barbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/qhrPX84GMT0' },
    { id: 'u80', name: 'Barbell Reverse Spider Curl', muscles: ['Biceps', 'Forearms'], equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/JQflklXBqpI' },
    { id: 'u81', name: 'Barbell Standing Wrist Curl', muscles: ['Forearms'], equipment: ['Barbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/Smy8-TlIdZs' },
    { id: 'u82', name: 'Palms Up Barbell Wrist Curls (Bench)', muscles: ['Forearms'], equipment: ['Barbell', 'Bench'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/PLRvnU256fM' },
    { id: 'u83', name: 'Decline Bar Skullcrushers', muscles: ['Triceps'], equipment: ['Barbell', 'Bench'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/QvoVwV11Exk' },
    { id: 'u84', name: 'Narrow Grip Tricep Press To Chin', muscles: ['Triceps', 'Chest'], equipment: ['Barbell', 'Bench'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/APjlsxCujtU' },
    { id: 'u85', name: 'Barbell Lying Triceps Skull Crushers', muscles: ['Triceps'], equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/YIUxnAqyOkw' },

    // Batch 12 Requests (Barbell - Legs)
    { id: 'u86', name: 'Front Barbell Pause Squats', muscles: ['Quads', 'Glutes', 'Core'], equipment: ['Barbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/JVUpK93w-dM' },
    { id: 'u87', name: 'Alternating Barbell Curtsy Squats', muscles: ['Quads', 'Glutes'], equipment: ['Barbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/_yJVaRK7d2E' },
    { id: 'u88', name: 'Jerk Dip Squat', muscles: ['Quads', 'Glutes'], equipment: ['Barbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/ayXsURQYBRc' },
    { id: 'u89', name: 'Barbell Seated Calf Raises', muscles: ['Calves'], equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/7FrJYxZlbP4' },
    { id: 'u90', name: 'Stiff Leg Deadlift (Deficit)', muscles: ['Hamstrings', 'Glutes', 'Back'], equipment: ['Barbell', 'Plate'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/nzZyIcydGR8' },
    { id: 'u91', name: 'Barbell Single Leg Deadlift', muscles: ['Hamstrings', 'Glutes'], equipment: ['Barbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/1hO4aZJXC9g' },
    { id: 'u92', name: 'Barbell Hip Thrust', muscles: ['Glutes', 'Hamstrings'], equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/Z8h4M-gZHEE' },
    { id: 'u93', name: 'Unilateral Barbell Hip Thrust', muscles: ['Glutes', 'Hamstrings'], equipment: ['Barbell', 'Bench'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/X1Q_0-1XAPg' },

    // Batch 13 Requests (Mixed - Chest & Core)
    { id: 'u94', name: 'Push Ups', muscles: ['Chest', 'Triceps', 'Core'], equipment: ['Bodyweight', 'Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/VHH05Wq-Q94' },
    { id: 'u95', name: 'Single Arm Dumbbell Floor Press', muscles: ['Chest', 'Triceps'], equipment: ['Dumbbell', 'Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/uF42bGLRFZA' },
    { id: 'u96', name: 'Janda Sit-Up', muscles: ['Core'], equipment: ['Bodyweight', 'Dumbbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/YmFUwwrm7fw' },
    { id: 'u97', name: 'Flat Bench Lying Leg Raises', muscles: ['Core'], equipment: ['Bodyweight', 'Dumbbell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/VwwAtoAc_9A' },
    { id: 'u98', name: 'Frog Sit Ups', muscles: ['Core'], equipment: ['Bodyweight', 'Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/1uDryAdUg3I' },
    { id: 'u99', name: 'Oblique Crunches', muscles: ['Core'], equipment: ['Bodyweight', 'Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/jf_6W5moHKs' },
    { id: 'u100', name: 'Alternating Heel Touches', muscles: ['Core'], equipment: ['Bodyweight', 'Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/ZSAAMH8C8Qg' },

    // Batch 14 Requests (Mixed - Shoulders, Biceps, Forearms, Triceps)
    { id: 'u101', name: 'Alternating Seated Dumbbell Shoulder Press', muscles: ['Shoulders', 'Triceps'], equipment: ['Dumbbell', 'Bodyweight', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/ITVw5Di2sCM' },
    { id: 'u102', name: 'Standing Rear Delt Flyes (Head Supported)', muscles: ['Shoulders', 'Back'], equipment: ['Dumbbell', 'Bodyweight', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/VqkTjojU5Uw' },
    { id: 'u103', name: 'Lying High Bench Spider Curls', muscles: ['Biceps'], equipment: ['Barbell', 'Dumbbell', 'Bodyweight', 'Bench'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/vBUKoWyck58' },
    { id: 'u104', name: 'Alternate Incline Bicep Curls', muscles: ['Biceps'], equipment: ['Dumbbell', 'Bodyweight', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/DJIoOfBeFfc' },
    { id: 'u105', name: 'Concentration Curl (Stability Ball)', muscles: ['Biceps'], equipment: ['Dumbbell', 'Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/H5bUYLXQ5mo' },
    { id: 'u106', name: 'Dumbbell Finger Curls (Behind Back)', muscles: ['Forearms'], equipment: ['Dumbbell', 'Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/AiBPo7USdH8' },
    { id: 'u107', name: 'Wrist Circles (Warm-up)', muscles: ['Forearms'], equipment: ['Bodyweight', 'Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/DxlU-S9jYAM' },
    { id: 'u108', name: 'Reverse Grip Tricep Pushdowns', muscles: ['Triceps'], equipment: ['Band', 'Bodyweight', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/EHd0NygL5QQ' },
    { id: 'u109', name: 'Exercise Ball Supine Triceps Extension', muscles: ['Triceps'], equipment: ['Dumbbell', 'Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/PG7tjzgN5kw' },

    // Batch 15 Requests (Kettlebell - Shoulders, Forearms)
    { id: 'u110', name: 'Double Kettlebell Push Press', muscles: ['Shoulders', 'Triceps'], equipment: ['Kettlebell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/bfynttxdNCY' },
    { id: 'u111', name: 'Kettlebell Upright Rows', muscles: ['Shoulders', 'Traps', 'Biceps'], equipment: ['Kettlebell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/mMY8YlOPJ3Y' },
    { id: 'u112', name: 'Single Arm Kettlebell Push Press', muscles: ['Shoulders', 'Triceps'], equipment: ['Kettlebell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/by0Uju_mR5o' },
    { id: 'u113', name: 'Kettlebell Wrist Curl', muscles: ['Forearms'], equipment: ['Kettlebell', 'Bench'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/3zfwIgFGzOI' },

    // Batch 16 Requests (Kettlebell - Chest, Core)
    { id: 'u114', name: 'One-Arm Kettlebell Floor Press', muscles: ['Chest', 'Triceps'], equipment: ['Kettlebell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/jPFqABJ7zMs' },
    { id: 'u115', name: 'Weighted Crunches (Kettlebell)', muscles: ['Core'], equipment: ['Kettlebell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/WBO_pPWqUT8' },
    { id: 'u116', name: 'V Sit Rotation (Kettlebell)', muscles: ['Core'], equipment: ['Kettlebell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/pxhWwhilRjY' },

    // Batch 17 Requests (Kettlebell - Legs)
    { id: 'u117', name: 'Step Up With Knee Raise', muscles: ['Quads', 'Glutes', 'Hamstrings', 'Cardio'], equipment: ['Kettlebell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/ziUy6B7uFZI' },
    { id: 'u118', name: 'Kettlebell Front Squats', muscles: ['Quads', 'Glutes'], equipment: ['Kettlebell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/XPaz55TDayQ' },
    { id: 'u119', name: 'Kettlebell Goblet Squat', muscles: ['Quads', 'Glutes'], equipment: ['Kettlebell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/z6yeNhwCP08' },

    // Batch 18 Requests (Kettlebell - Back)
    { id: 'u120', name: 'Single Arm Kettlebell Rows', muscles: ['Back', 'Lats', 'Biceps'], equipment: ['Kettlebell', 'Bench'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/omPcL1O5mOQ' },
    { id: 'u121', name: 'Kettlebell Good Morning', muscles: ['Back', 'Hamstrings', 'Glutes'], equipment: ['Kettlebell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/A6GT8GoyzEI' },
    { id: 'u122', name: 'Kettlebell Bent Over Rows', muscles: ['Back', 'Lats', 'Biceps'], equipment: ['Kettlebell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/rTfnq1MpL5o' },
    { id: 'u123', name: 'Kettlebell Decline Shrug', muscles: ['Back', 'Traps', 'Shoulders'], equipment: ['Kettlebell', 'Bench'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/Od8oPnpAhB4' },

    // Batch 19 Requests (Band - Chest, Core, Neck)
    { id: 'u124', name: 'Banded Push-Ups', muscles: ['Chest', 'Triceps', 'Core'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/uDwTmmVTm3o' },
    { id: 'u125', name: 'Dynaband Chest Press', muscles: ['Chest', 'Triceps'], equipment: ['Band'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/gloXRICjqKU' },
    { id: 'u126', name: 'Assisted Push-Ups with Band', muscles: ['Chest', 'Triceps'], equipment: ['Band', 'Pull-up bar'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/2rh8lQ8iFcI' },
    { id: 'u127', name: 'Reverse Crunches with Band', muscles: ['Core'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/NZB9F_BZ8nI' },
    { id: 'u128', name: 'Band Airbike', muscles: ['Core'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/BvE376dEcQE' },
    { id: 'u129', name: 'Resistance Band Spider Crawls', muscles: ['Core'], equipment: ['Band'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/wApM9NzULM8' },
    { id: 'u130', name: 'Band Shrug Back', muscles: ['Neck', 'Back', 'Shoulders'], equipment: ['Band'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/ZZc8PO9jzi0' },

    // Batch 20 Requests (Band - Shoulders, Forearms, Triceps)
    { id: 'u131', name: 'Band Shoulder Adduction', muscles: ['Shoulders', 'Chest'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/4dru-w7_rxM' },
    { id: 'u132', name: 'Banded Front Raises', muscles: ['Shoulders'], equipment: ['Band'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/BChDZ6V1reY' },
    { id: 'u133', name: 'Frontal Horizontal Pull with Elastic Band', muscles: ['Shoulders', 'Back'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/9XWZcAB-zqc' },
    { id: 'u134', name: 'Band Reverse Wrist Curl', muscles: ['Forearms'], equipment: ['Band'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/txXXKbEuM5o' },
    { id: 'u135', name: 'Band Wrist Curl', muscles: ['Forearms'], equipment: ['Band'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/_AYQe1JA8qw' },
    { id: 'u136', name: 'Banded Skull Crushers', muscles: ['Triceps'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/mJENdCjJw4A' },
    { id: 'u137', name: 'Banded Tricep Extensions', muscles: ['Triceps'], equipment: ['Band'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/x0Sl4jzvQKo' },
    { id: 'u138', name: 'Dynaband Overhead Tricep Extensions', muscles: ['Triceps'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/EXZWYmTwdy8' },

    // Batch 21 Requests (Band - Legs: Quads, Glutes, Hamstrings, Calves)
    { id: 'u139', name: 'Kneeling Resistance Band Kickback', muscles: ['Glutes', 'Hamstrings'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/IXKwZgDsC7c' },
    { id: 'u140', name: 'Resistance Band Reverse Hyper (Stability Ball)', muscles: ['Glutes', 'Hamstrings', 'Back'], equipment: ['Band', 'Stability Ball'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/8zsfeLHXbts' },
    { id: 'u141', name: 'Unilateral Band Kickback', muscles: ['Glutes', 'Hamstrings'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/iuo7Q1FBmbM' },
    { id: 'u142', name: 'Kneeling Hip Thrusts', muscles: ['Glutes'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/irt0_u3P4mU' },
    { id: 'u143', name: 'Slingshot Glute Bridges', muscles: ['Glutes'], equipment: ['Band'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/dU4uFAV6gD8' },
    { id: 'u144', name: 'Lateral Band Walk', muscles: ['Glutes', 'Quads', 'Cardio'], equipment: ['Band'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/mGK4puFaSUA' },

    // Batch 22 Requests (Plate - Chest, Core)
    { id: 'u145', name: 'Laying Svend Press', muscles: ['Chest', 'Triceps'], equipment: ['Plate'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/Cndkhx9Lkts' },
    { id: 'u146', name: 'Svend Press', muscles: ['Chest', 'Shoulders'], equipment: ['Plate'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/aCfRy4S7su4' },
    { id: 'u147', name: 'Otis Ups (Plate)', muscles: ['Core'], equipment: ['Plate'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/HO9cFagYKEI' },
    { id: 'u148', name: 'Exercise Ball Torso Rotation', muscles: ['Core'], equipment: ['Plate', 'Stability Ball'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/dWWEVE_LSdA' },
    { id: 'u149', name: 'Weighted Overhead Crunch (Stability Ball)', muscles: ['Core'], equipment: ['Plate', 'Stability Ball'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/aoqdWmC1Zn0' },
    { id: 'u150', name: 'Weighted Seated Twist (Stability Ball)', muscles: ['Core'], equipment: ['Plate', 'Stability Ball'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/nM6Z3D8s3Tc' },
    { id: 'u151', name: 'V Sit Rotation (Plate)', muscles: ['Core'], equipment: ['Plate'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/pxhWwhilRjY' },

    // Batch 23 Requests (Plate - Shoulders, Biceps, Forearms, Triceps)
    { id: 'u152', name: 'Front Plate Raise', muscles: ['Shoulders'], equipment: ['Plate'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/lhCwTeFSEOQ' },
    { id: 'u153', name: 'Plate Bus Driver', muscles: ['Shoulders'], equipment: ['Plate'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/4yEUBhLbnrk' },
    { id: 'u154', name: 'Plate Pinch', muscles: ['Forearms'], equipment: ['Plate'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/b7FobDcRuek' },
    { id: 'u155', name: 'Weighted Seated Reverse Wrist Curl', muscles: ['Forearms'], equipment: ['Plate', 'Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/zTXLwaKruJY' },
    { id: 'u156', name: 'Weighted Standing Curl for Forearms', muscles: ['Forearms', 'Biceps'], equipment: ['Plate', 'Barbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/gKgD4sd-bYg' },
    { id: 'u157', name: 'Standing Narrow Grip EZ Bar Overhead Tricep Extensions', muscles: ['Triceps'], equipment: ['Barbell', 'Plate'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/_pnkxxTBGP0' }, // User listed under Plate, but name implies Barbell/EZ Bar. Added both tags to be safe.

    // Batch 24 Requests (Plate - Legs: Quads, Calves, Glutes, Hamstrings)
    { id: 'u158', name: '45 Degree Leg Press Narrow Stance', muscles: ['Quads', 'Glutes'], equipment: ['Plate'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/UI_u1mDY2Ck' },
    { id: 'u159', name: 'Power Snatch', muscles: ['Quads', 'Glutes', 'Hamstrings', 'Back', 'Shoulders'], equipment: ['Plate', 'Barbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/mk9zgQtPxi0' },
    { id: 'u160', name: 'Belt Squats', muscles: ['Quads', 'Glutes'], equipment: ['Plate'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/mbmCrmyeMOM' },
    { id: 'u161', name: 'Seated Calf Raise Machine', muscles: ['Calves'], equipment: ['Plate'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/_mJIsBzrVbc' },

    // Batch 25 Requests (Pull-up Bar - Chest, Core)
    { id: 'u162', name: 'Chest Dip on Straight Bar', muscles: ['Chest', 'Triceps'], equipment: ['Pull-up bar'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/zl7p1JoRpx4' },
    { id: 'u163', name: 'Front Lever', muscles: ['Core', 'Back', 'Lats'], equipment: ['Pull-up bar'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/39DtAeJRzOw' },
    { id: 'u164', name: 'Hanging Leg Raises', muscles: ['Core'], equipment: ['Pull-up bar'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/dWVNptGGgDE' },
    { id: 'u165', name: 'Hanging Knee Raises', muscles: ['Core'], equipment: ['Pull-up bar'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/yybIhG9-qok' },

    // Batch 26 Requests (Pull-up Bar - Shoulders, Biceps, Forearms, Triceps)
    { id: 'u166', name: 'One-Arm Chin', muscles: ['Biceps', 'Forearms', 'Back'], equipment: ['Pull-up bar'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/oaSKpy8Qq1I' },
    { id: 'u167', name: 'Archer Pull-Ups', muscles: ['Back', 'Biceps', 'Shoulders'], equipment: ['Pull-up bar'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/8zOuX0__hJY' },

    // Batch 27 Requests (Bench - Chest, Core)
    { id: 'u168', name: 'Decline Push Ups', muscles: ['Chest', 'Triceps'], equipment: ['Bench', 'Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/Ap1ZnBEjgmk' },
    { id: 'u169', name: 'Alternating Incline Dumbbell Chest Press', muscles: ['Chest', 'Triceps'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/J98frFHqcI0' },
    { id: 'u170', name: 'Flat Dumbbell Flyes', muscles: ['Chest'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/sv-pGiNXGLQ' },
    { id: 'u171', name: 'Decline Oblique Crunches', muscles: ['Core'], equipment: ['Bench', 'Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/LTIp5Ed-VhM' },
    { id: 'u172', name: 'Weighted Twisting Crunch (Bench)', muscles: ['Core'], equipment: ['Bench', 'Plate', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/4nA3x9KVeCo' },
    { id: 'u173', name: 'Weighted Floor Twisting Crunch (Feet on Bench)', muscles: ['Core'], equipment: ['Bench', 'Plate', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/JnLnl-jFD4Q' },

    // Batch 28 Requests (Bench - Shoulders, Biceps, Forearms, Triceps)
    { id: 'u174', name: 'Chest Supported EZ Bar Front Raises', muscles: ['Shoulders'], equipment: ['Bench', 'Barbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/cVPsooenxRw' },
    { id: 'u175', name: 'Single Arm Seated Dumbbell Shoulder Press Neutral Grip', muscles: ['Shoulders', 'Triceps'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/3Cfy2SPLBls' },
    { id: 'u176', name: 'Chest Supported Dumbbell Rear Delt Flyes', muscles: ['Shoulders', 'Back'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/N4R7XazODZ0' },
    { id: 'u177', name: 'Lying High Bench Barbell Curls (Spider)', muscles: ['Biceps'], equipment: ['Bench', 'Barbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/vBUKoWyck58' },
    { id: 'u178', name: 'Concentration Curls with Dumbbell', muscles: ['Biceps'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/bEcwNRJh_6g' },
    { id: 'u179', name: 'Dumbbell Hammer Spider Curls', muscles: ['Biceps', 'Forearms'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/AYFDPoV3YXU' },
    { id: 'u180', name: 'Single Arm Wrist Curls Over A Bench Palm Up', muscles: ['Forearms'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/YG1EcoauOlY' },
    { id: 'u181', name: 'Cable Wrist Curl', muscles: ['Forearms'], equipment: ['Band'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/0KmV_mUB1tw' }, // Mapped to Band for visibility as Cable Machine is not in selector
    { id: 'u182', name: 'Dumbbell Over Bench Reverse Wrist Curl', muscles: ['Forearms'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/QHz0tQUw9z8' },
    { id: 'u183', name: 'Incline Wide Grip EZ Bar Tricep Extensions', muscles: ['Triceps'], equipment: ['Bench', 'Barbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/iSrBs1kyKkA' },
    { id: 'u184', name: 'Seated Single Arm Dumbbell Overhead Tricep Extensions', muscles: ['Triceps'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/r6ziRqwjG9E' },
    { id: 'u185', name: 'One Arm Supinated Dumbbell Triceps Extension', muscles: ['Triceps'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/iaX_XnnRWKU' },

    // Batch 29 Requests (Bench - Legs: Quads, Calves, Glutes, Hamstrings)
    { id: 'u186', name: 'Single-Leg High Box Squat (Bulgarian)', muscles: ['Quads', 'Glutes'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/oemJWuqrABo' },
    { id: 'u187', name: 'Step Up', muscles: ['Quads', 'Glutes', 'Hamstrings', 'Cardio'], equipment: ['Bench', 'Bodyweight'], difficulty: 'Beginner', videoUrl: 'https://youtu.be/Czugr6IPqN4' },
    { id: 'u188', name: 'Dumbbell Goblet Box Squat', muscles: ['Quads', 'Glutes'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/FPG9xwCBqWY' },
    { id: 'u189', name: 'Single Leg Dumbbell Seated Calf Raises', muscles: ['Calves'], equipment: ['Bench', 'Dumbbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/BmPtVqmahjA' },
    { id: 'u190', name: 'Barbell Seated Calf Raises (Bench)', muscles: ['Calves'], equipment: ['Bench', 'Barbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/7FrJYxZlbP4' }, // Updated name to distinguish
    { id: 'u191', name: 'Stability Ball Reverse Hyperextension', muscles: ['Glutes', 'Hamstrings', 'Back'], equipment: ['Bench', 'Stability Ball'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/SkDkBXxdPVI' },
    { id: 'u192', name: 'Barbell Hip Thrust (Bench)', muscles: ['Glutes', 'Hamstrings'], equipment: ['Bench', 'Barbell'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/Z8h4M-gZHEE' },
    { id: 'u193', name: 'Unilateral Barbell Hip Thrust', muscles: ['Glutes', 'Hamstrings'], equipment: ['Bench', 'Barbell'], difficulty: 'Advanced', videoUrl: 'https://youtu.be/X1Q_0-1XAPg' },
    { id: 'u194', name: 'Alternating Bench Glute Kickbacks', muscles: ['Glutes', 'Hamstrings'], equipment: ['Bench', 'Bodyweight'], difficulty: 'Intermediate', videoUrl: 'https://youtu.be/KiQzJz6Pq-I' },
];

export const EQUIPMENT_LIST = [
    { id: 'bodyweight', name: 'Bodyweight', icon: '💪' },
    { id: 'dumbbell', name: 'Dumbbell', icon: '🏋️' },
    { id: 'barbell', name: 'Barbell', icon: '🏋️‍♂️' },
    { id: 'kettlebell', name: 'Kettlebell', icon: '🔔' },
    { id: 'band', name: 'Band', icon: '🎗️' },
    { id: 'plate', name: 'Plate', icon: '💿' },
    { id: 'pull-up bar', name: 'Pull-up bar', icon: '∏' },
    { id: 'bench', name: 'Bench', icon: '🪑' },
];
