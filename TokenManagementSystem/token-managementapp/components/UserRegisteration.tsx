'use client'
import {useState} from 'react'
import axios from 'axios'
const UserRegisteration = () => {
    const[name,setName] = useState('');
    const [token, setToken] = useState(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const response = await axios.post('/api/tokens', { name });
      setToken(response.data.tokenNumber);
    };
  
  return (
    <div>
    <h2>Register for a token</h2>
    <form onSubmit={handleSubmit}>
        <input
        type='text'
        value={name}
        onChange={(e)=>setName(e.target.value)}
        placeholder='Enter your name'
        required
        />
        <button type='submit'>Get Token</button>
   </form>  
   {token && <p>Your token no is:{token}</p>}
    </div>
  )
}

export default UserRegisteration
