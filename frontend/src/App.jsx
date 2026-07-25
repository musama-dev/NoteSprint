import {Navigate, Route, Routes} from "react-router-dom"
import Home from './pages/Home'
import Auth from './pages/Auth'
import Notes from './pages/Notes'
import useCurrentUser from './hooks/useCurrentUser'
import { useSelector } from "react-redux"
import Pricing from "./pages/Pricing"
import History from "./pages/History"
import About from "./pages/About"
import LoadingScreen from "./components/LoadingScreen"
import Contact from "./pages/Contact"
import Terms from "./pages/Terms"
function App() {
  useCurrentUser()

  const {userData, loading} = useSelector((state)=>state.user)

  if (loading) return <LoadingScreen />

  return (
    <>
      <Routes>
        <Route path='/' element={!userData ? <Navigate to="/auth"/> : <Home/>} />
        <Route path='/auth' element={userData ? <Navigate to="/"/> : <Auth/>} />
        <Route path='/notes' element={userData ? <Notes/> : <Navigate to="/auth"/>} />
        <Route path='/pricing' element={userData ? <Pricing/> : <Navigate to="/auth"/>} />
        <Route path='/history' element={userData ? <History/> : <Navigate to="/auth"/>} />
        <Route path='/about' element={<About/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/terms' element={<Terms/>} />
      </Routes>
    </>
  )
}

export default App