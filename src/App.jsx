// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Ensure this file exists and is correct
import { getSunSign, getMoonSign, messages } from './astroUtils'; // Import astro logic
import './App.css'; // Ensure this file exists

// --- React App Component ---

function App() {
  // State Variables
  const [session, setSession] = useState(null); // Stores the user's login session
  const [userProfile, setUserProfile] = useState(null); // Stores profile data from Supabase Auth/metadata
  const [dob, setDob] = useState(''); // Stores the Date of Birth input value
  const [astroResult, setAstroResult] = useState(''); // Stores the generated HTML result string
  const [astroResultText, setAstroResultText] = useState(''); // Stores the plain text result for sharing/copying

  // --- Authentication Effect Hook ---
  // This runs once when the component loads and listens for auth changes
  useEffect(() => {
    // 1. Check if a session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserProfile(session ? (session.user.user_metadata || {}) : null);
      console.log("Initial session:", session);
    }).catch(error => {
        console.error("Error getting initial session:", error);
    });

    // 2. Listen for future login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      setUserProfile(session ? (session.user.user_metadata || {}) : null);

      // Clear DOB and results if user logs out
      if (!session) {
        setDob('');
        setAstroResult('');
        setAstroResultText(''); // Clear text result on logout too
      }
    });

    // 3. Cleanup: Unsubscribe from the listener when the component unmounts
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty array means this effect runs only once on mount

  // --- Login Handlers ---
  async function handleGoogleLogin() {
    console.log("Attempting Google login...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin // Use current origin (IDX Preview URL)
        // Or replace window.location.origin with your specific IDX Preview URL string if needed
        // redirectTo: 'https://9000-idx-baatcheetcreator-ai-1743616155739.cluster-w5vd22whf5gmav2vgkomwtc4go.cloudworkstations.dev/'
      }
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
    // const { error } = await supabase.auth.signInWithOAuth({
    //   provider: 'facebook',
    //   options: {
    //      redirectTo: window.location.origin // Or your IDX Preview URL
    //   }
    // });
    // if (error) console.error('Error logging in with Facebook:', error.message);
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
    if (!dob) {
      alert('Please enter your Date of Birth.');
      return;
    }
    console.log('Generating insights for DOB:', dob);

    const dateObject = new Date(dob + 'T00:00:00');

    if (isNaN(dateObject.getTime())) {
         alert('Invalid Date entered. Please check your selection.');
         return;
    }

    // Use imported functions
    const sunSignResult = getSunSign(dateObject);
    const moonSignResult = getMoonSign(dateObject);

    const sunMsgKey = sunSignResult.toLowerCase();
    const moonMsgKey = moonSignResult.toLowerCase();
    const sunMessageText = messages.sun[sunMsgKey] || `Message not found for Sun sign ${sunSignResult}.`;
    const moonMessageText = messages.moon[moonMsgKey] || `Message not found for Moon sign ${moonSignResult}.`;
    const combinedMessageText = `Your ${sunSignResult} sun energy combines with your ${moonSignResult} moon instincts. Embrace both!`;

    // Construct the HTML string for display
    const resultHtml = `
      <div class="sign-box">
        <h2>☀️ ${sunSignResult}</h2>
        <p>"${sunMessageText}"</p>
      </div>
      <div class="sign-box">
        <h2>🌙 ${moonSignResult}</h2>
        <p>"${moonMessageText}"</p>
      </div>
      <div class="combined-message">
        <h3>🌟 Combined Wisdom:</h3>
        <p>"${combinedMessageText}"</p>
      </div>
    `;
    setAstroResult(resultHtml); // Update HTML result state

    // Generate and set Plain Text Version for Sharing/Copying
    const plainTextResult = `My Astro Insights ✨\n\n☀️ ${sunSignResult}: "${sunMessageText}"\n\n🌙 ${moonSignResult}: "${moonMessageText}"\n\n🌟 Combined: "${combinedMessageText}"\n\n(Generated by I've Got A Sign!)`;
    setAstroResultText(plainTextResult); // Update text result state

    console.log("Generated results for:", sunSignResult, moonSignResult);
  }

  // --- Share Handler (Web Share API) ---
  async function handleShare() {
    if (!astroResultText) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Astro Insights!",
          text: astroResultText,
          // url: window.location.origin // You could share the app's main URL
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
              alert('Results copied to clipboard!'); // Simple feedback
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

          <div className="dob-section">
            <label htmlFor="dob">Enter your Date of Birth:</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
            <button onClick={handleGenerateInsights}>Generate Astro Insights</button>
          </div>

          {/* Display Astro Result if available */}
          {astroResult && (
             <> {/* Fragment to group result and buttons */}
               <div className="result" dangerouslySetInnerHTML={{ __html: astroResult }}></div>
               {/* Share/Copy Buttons - Appear only WITH results */}
               <div className="share-buttons" style={{ marginTop: '15px' }}>
                 {/* Conditionally render Web Share button only if supported */}
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