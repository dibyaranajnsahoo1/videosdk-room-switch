
export const getAuthToken = async () => {
  return import.meta.env.VITE_VIDEOSDK_TOKEN;
};

export const createMeeting = async (token) => {
  const res = await fetch("https://api.videosdk.live/v2/rooms", {
    method: "POST",
    headers: {
      authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const { roomId } = await res.json();
  return roomId;
};

export const createBothRooms = async () => {
  const token = import.meta.env.VITE_VIDEOSDK_TOKEN;
  const roomA = await createMeeting(token);
  const roomB = await createMeeting(token);
  return { roomA, roomB };
};
