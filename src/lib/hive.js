export const hasKeychain = () => {
  return !!window.hive_keychain;
};

// 1. FETCH COMMUNITIES (NEW)
// We use the public Hive API (Bridge) to get subscriptions
// 1. FETCH COMMUNITIES (FIXED)
export const fetchUserCommunities = async (username) => {
  try {
    const response = await fetch('https://api.hive.blog', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'bridge.list_all_subscriptions',
        params: { account: username },
        id: 1
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    const result = data.result || [];

    // FIX: The API returns arrays like ["hive-123", "Community Name", ...].
    // We map them to objects so the UI can read them easily.
    return result.map(item => ({
      name: item[0],  // The ID (e.g. hive-123456)
      title: item[1]  // The Human Name (e.g. Photography Lovers)
    }));

  } catch (error) {
    console.error("Failed to fetch communities", error);
    return [];
  }
};

export const loginWithKeychain = (username) => {
  return new Promise((resolve, reject) => {
    if (!hasKeychain()) {
      reject(new Error("Hive Keychain not installed!"));
      return;
    }
    const memo = "Login to Hive Studio";
    window.hive_keychain.requestSignBuffer(username, memo, "Posting", (response) => {
      if (response.success) {
        resolve(response);
      } else {
        reject(new Error(response.message));
      }
    });
  });
};

// 2. UPDATED PUBLISH LOGIC
// Now accepts 'community' in the options object
export const publishPost = (username, { title, description, tags, payout, community }, body) => {
  return new Promise((resolve, reject) => {
    if (!hasKeychain()) return reject(new Error("Keychain missing"));

    const permlink = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') 
      .replace(/\s+/g, '-')         
      + '-' + Date.now();           

    const jsonMetadata = {
      tags: tags,
      description: description,
      app: "hive-studio/1.0",
      format: "html"
    };

    // LOGIC: If a community is selected, it becomes the parent_permlink.
    // If not, the first tag becomes the parent_permlink (Posting to Blog).
    const parent_permlink = community ? community : (tags[0] || "hive");

    let max_accepted_payout = '1000000.000 HBD';
    let percent_hbd = 10000;
    let allow_votes = true;
    let allow_curation_rewards = true;

    if (payout === '100%') percent_hbd = 0;
    else if (payout === '0%') max_accepted_payout = '0.000 HBD';

    const postOp = [
      "comment",
      {
        parent_author: "", 
        parent_permlink: parent_permlink, // Updated here
        author: username,
        permlink: permlink,
        title: title,
        body: body,
        json_metadata: JSON.stringify(jsonMetadata)
      }
    ];

    const optionsOp = [
      "comment_options",
      {
        author: username,
        permlink: permlink,
        max_accepted_payout: max_accepted_payout,
        percent_hbd: percent_hbd,
        allow_votes: allow_votes,
        allow_curation_rewards: allow_curation_rewards,
        extensions: [] 
      }
    ];

    window.hive_keychain.requestBroadcast(
      username,
      [postOp, optionsOp], 
      "Posting",
      (response) => {
        if (response.success) {
          resolve({ ...response, permlink }); 
        } else {
          reject(new Error(response.message));
        }
      }
    );
  });
};