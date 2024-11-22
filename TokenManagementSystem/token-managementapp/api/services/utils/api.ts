import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:2000/api',
});
export const fetchMenuItems = async () => {
  const response = await api.get('/menu');
  return response.data;
};

export const createMenuItem = async (item: { itemName: string; price: number }) => {
  try {
    const payload = { items: [item] }; // Create payload
    console.log('Sending payload:', payload); // Log payload
    const response = await api.post('/menu', payload); // Send request
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};


export const updateMenuItem = async (id: string, item: { itemName: string; price: number }) => {
  const response = await api.patch(`/menu/${id}`, item);
  return response.data;
};

export const  deleteMenuItem = async (id: string) => {
  try {
    await api.delete(`http://localhost:2000/api/menu/${id}`);
    fetchMenuItems()

  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

export const createToken = async (menuItemId: number) => {
  const response = await api.post('/tokens', { menuItem: menuItemId });
  return response.data;
};

export const fetchActiveTokens = async () => {
  try {
    const response = await api.get('/tokens');
    return response.data;
  } catch (error) {
    console.error('Error fetching active tokens:', error);
    throw error; // Rethrow error to handle it in the calling code if needed
  }
};
// Example function to update the token status from the frontend
export const completeToken = async (tokenId:number) => {
    try {
        const response = await api.patch('/tokens/update-status', { tokenId, status: 'completed' });
        return response.data;
    } catch (error) {
        console.error("Error completing token:", error);
        throw error; // Handle or throw the error as necessary
    }
};
export const usercredentials = async (email: string, password: string) => {
  try {
    const response = await api.post('/mainuser', { email, password });
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};