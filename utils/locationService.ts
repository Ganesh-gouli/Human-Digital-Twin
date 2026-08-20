export interface Hospital {
    name: string;
    address: string;
    distanceInfo?: string;
    lat?: number;
    lon?: number;
}

export const fetchNearbyHospitals = async (lat: number, lng: number, type: string): Promise<Hospital[]> => {
    // Simulated fetching logic for demonstration
    console.log(`Mock: Fetching nearby ${type} hospitals at ${lat}, ${lng}`);
    await new Promise(res => setTimeout(res, 1000));

    return [
        {
            name: "City Oncology Center",
            address: "123 Medical Way, Health City",
            distanceInfo: "1.2 km away"
        },
        {
            name: "Hope General Hospital",
            address: "456 Care St, Central District",
            distanceInfo: "3.5 km away"
        },
        {
            name: "Advanced Imaging & Cancer Clinic",
            address: "789 Diagnostic Ln, West End",
            distanceInfo: "5.1 km away"
        }
    ];
};
