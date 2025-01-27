import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import Components
import Login from "./Login";
import Signup from "./Signup";
import Player from "./Player";
import PlayerProfile from "./player_profile";
import PlayerQuestions from "./PlayerQuestions";
import PlayerLeaderboard from "./player_leaderboard";
import Categories from "./Categories";
import Questions from "./Questions";
import Profile from "./profile";
import Designer from "./Designer";
import PlayerProfileMain from "./player_profile_now";
import PlayerSearch from "./PlayerSearch";
import Feed from "./Feed" ;


const App = () => {
  return (
    <Router>
      <Routes>
        {/* صفحه پیش‌فرض: صفحه ورود */}
        <Route path="/" element={<Signup />} />

        {/* مسیرهای دیگر */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/player/search" element={<PlayerSearch />} />

        <Route path="/player" element={<Player />} />
        <Route path="/player/profile/main" element={<PlayerProfileMain />} />
        <Route path="/player/profile" element={<PlayerProfile />} />
        <Route path="/player/questions" element={<PlayerQuestions />} />
        <Route path="/player/leaderboard" element={<PlayerLeaderboard />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/designer/profile" element={<Profile />} />
        <Route path="/designer/questions" element={<Questions />} />
        <Route path="/designer/categories" element={<Categories />} />
        <Route path="/designer" element={<Designer />} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </Router>
  );
};

export default App;
