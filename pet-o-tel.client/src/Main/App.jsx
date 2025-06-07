import './App.css';
import MainPage from '../Pages/MainPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OAuthCallback from '../Components/OAuthCallback';
import SearchResults from '../Pages/SearchResult';
import MyAccount from '../Pages/MyAccount';
import ServicePage from '../Pages/ServicePage';

function App() {
    

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/oauth-callback" element={<OAuthCallback />} />
                <Route path="search" element={<SearchResults />} />
                <Route path="/account" element={<MyAccount />} />
                <Route path="/service" element={<ServicePage />} />
            </Routes>
        </Router>
    );
}

export default App;