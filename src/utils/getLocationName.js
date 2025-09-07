const getLocationName = async (latitude, longitude) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        return data.display_name || "Unknown Location";
    } catch (error) {
        console.error("Error fetching location:", error);
        return "Unknown Location";
    }
};

export {getLocationName};