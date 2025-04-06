// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Ensure this file exists and is correct
import { getSunSign, getMoonSign, messages as astroMessages } from './astroUtils'; // Make sure astroUtils.js exists and exports these
import './App.css'; // Make sure App.css exists

// --- React App Component ---

function App() {
  // State Variables
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [dob, setDob] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [astroResult, setAstroResult] = useState('');
  const [astroResultText, setAstroResultText] = useState('');

  // --- Authentication Effect Hook ---
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserProfile(session ? (session.user.user_metadata || {}) : null);
      console.log("Initial session:", session);
    }).catch(error => {
        console.error("Error getting initial session:", error);
    });

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      setUserProfile(session ? (session.user.user_metadata || {}) : null);
      // Clear all inputs and results on logout
      if (!session) {
        setDob('');
        setBirthTime('');
        setBirthLocation('');
        setAstroResult('');
        setAstroResultText('');
      }
    });

    // Cleanup listener
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // --- Login Handlers ---
  async function handleGoogleLogin() {
    console.log("Attempting Google login...");
    // Using Site URL config now, removed explicit redirectTo
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    if (error) {
        console.error('Error logging in with Google:', error.message);
        alert(`Google Login Error: ${error.message}`);
    } else {
        console.log("Redirecting for Google login...");
    }
  }

  async function handleFacebookLogin() {
    // NOTE: Facebook login is currently deferred.
    alert("Facebook login is temporarily unavailable.");
  }

  // --- Logout Handler ---
  async function handleLogout() {
    console.log("Attempting logout...");
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error.message);
        alert(`Logout Error: ${error.message}`);
    } else {
        console.log("Logout successful.");
    }
  }

  // --- Astro Calculation and Display ---
  function handleGenerateInsights() {
    // Check required inputs
    if (!dob || !birthTime || !birthLocation) {
      alert('Please enter Date of Birth, Time of Birth, and Place of Birth.');
      return;
    }
    console.log('Generating insights for DOB:', dob, 'TOB:', birthTime, 'POB:', birthLocation);

    const dateObject = new Date(dob + 'T00:00:00'); // Add time to avoid potential timezone day-off errors

    if (isNaN(dateObject.getTime())) { // Check if date is valid
         alert('Invalid Date entered. Please check your selection.');
         return;
    }

    // --- Calculate Signs ---
    const sunSignResult = getSunSign(dateObject);
    const moonSignResult = getMoonSign(dateObject); // Still using simplified version

    // --- TODO: Calculate Rising Sign ---
    // Placeholder value - will be replaced by actual calculation later
    const risingSignResult = 'Aries'; // Placeholder value (Removed "(Placeholder)" text)
    // --- End of TODO ---

    // --- Get Messages ---
    const sunMsgKey = sunSignResult.toLowerCase();
    const moonMsgKey = moonSignResult.toLowerCase();
    const risingMsgKey = risingSignResult.toLowerCase();

    // Use messages from astroUtils.js (ensure it includes 'rising' messages)
    const sunMessageText = astroMessages.sun[sunMsgKey] || `Message not found for Sun sign ${sunSignResult}.`;
    const moonMessageText = astroMessages.moon[moonMsgKey] || `Message not found for Moon sign ${moonSignResult}.`;
    const risingMessageText = astroMessages.rising?.[risingMsgKey] || `You approach the world with ${risingSignResult} energy!`; // Removed "(Placeholder)" text from fallback

    // --- Create Combined Message ---
    const combinedMessageText = `Your ${sunSignResult} sun energy combines with your ${moonSignResult} moon instincts and ${risingSignResult} approach. Embrace all parts of you!`;

    // --- Construct HTML and Text results (Defined INSIDE the function scope) ---
    const resultHtml = `
      <div class="sign-box">
        <h2>☀️ Sun in ${sunSignResult}</h2>
        <p>"${sunMessageText}"</p>
      </div>
      <div class="sign-box">
        <h2>🌙 Moon in ${moonSignResult}</h2>
        <p>"${moonMessageText}"</p>
      </div>
      <div class="sign-box"> 
        <h2>🌅 Rising ${risingSignResult}</h2>
        <p>"${risingMessageText}"</p>
      </div>
      <div class="combined-message">
        <h3>🌟 Combined Wisdom:</h3>
        <p>"${combinedMessageText}"</p>
      </div>
    `;

    const plainTextResult = `My Astro Insights ✨\n\n☀️ Sun in ${sunSignResult}: "${sunMessageText}"\n\n🌙 Moon in ${moonSignResult}: "${moonMessageText}"\n\n🌅 Rising ${risingSignResult}: "${risingMessageText}"\n\n🌟 Combined: "${combinedMessageText}"\n\n(Check yours at ive-got-a-sign.baatcheetpodcast.com !)`;

    // --- Update State ---
    setAstroResult(resultHtml); // Update HTML result state
    setAstroResultText(plainTextResult); // Update text result state

    console.log("Generated results for:", sunSignResult, moonSignResult, risingSignResult);
  } // <-- End of handleGenerateInsights function

  // --- Share Handler (Web Share API) ---
  async function handleShare() {
    if (!astroResultText) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Astro Insights!",
          text: astroResultText // Sharing text only now
        });
        console.log('Result shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
        if (error.name !== 'AbortError') {
           alert(`Could not share: ${error.message}`);
        }
      }
    } else {
      alert('Web Share not supported on this browser. Use the Copy Text button instead.');
    }
  }

  // --- Copy Text Handler ---
  async function handleCopyText() {
      if (!astroResultText) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
              await navigator.clipboard.writeText(astroResultText);
              alert('Results copied to clipboard!');
          } catch (error) {
              console.error('Error copying text:', error);
              alert('Failed to copy text.');
          }
      } else {
          alert('Clipboard API not supported on this browser.');
      }
  }


  // --- Render Logic ---
  return (
    <div className="container">
      <h1>I've Got A Sign</h1>
      {!session ? (
        /* --- Logged Out View --- */
        <section id="login-section">
          <h2>Login to Discover Your Astro Profile</h2>
          <button onClick={handleGoogleLogin}>Login with Google</button>
          <button onClick={handleFacebookLogin} title="Facebook login temporarily unavailable">Login with Facebook</button>
        </section>
      ) : (
        /* --- Logged In View --- */
        <section id="profile-section">
          <h2>Welcome!</h2>
          {(userProfile?.picture || userProfile?.avatar_url) && (
            <img
              src={userProfile.picture || userProfile.avatar_url}
              alt="Your profile"
              style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '10px auto', display: 'block', border: '2px solid #eee' }}
              referrerPolicy="no-referrer"
            />
          )}
          <p>Logged in as: {userProfile?.full_name || userProfile?.name || session.user.email}</p>

          {/* Input Section */}
          <div className="dob-section">
            <div>
              <label htmlFor="dob">Date of Birth:</label>
              <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} required />
            </div>
            <div style={{ marginTop: '10px' }}>
              <label htmlFor="tob">Time of Birth (approx):</label>
              <input type="time" id="tob" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required />
            </div>
            <div style={{ marginTop: '10px' }}>
              <label htmlFor="pob">Place of Birth (City, Country):</label>
              <input type="text" id="pob" value={birthLocation} onChange={(e) => setBirthLocation(e.target.value)} placeholder="e.g., Kolkata, India" required />
            </div>
            <button onClick={handleGenerateInsights} style={{ marginTop: '15px' }}>
              Generate Astro Insights
            </button>
          </div>
          {/* End of Input Section */}

          {/* Display Astro Result and Share Buttons */}
          {astroResult && (
             <>
               <div className="result" dangerouslySetInnerHTML={{ __html: astroResult }}></div>
               <div className="share-buttons" style={{ marginTop: '15px' }}>
                 {navigator.share && (
                   <button onClick={handleShare} title="Share using device sharing options">Share Results</button>
                 )}
                 <button onClick={handleCopyText} title="Copy results text to clipboard">Copy Text</button>
               </div>
             </>
          )}

          {/* Logout Button */}
          <button onClick={handleLogout} style={{ marginTop: '20px', backgroundColor: '#ff6666'}}>Logout</button>
        </section>
      )}
    </div>
  );
}

export default App;