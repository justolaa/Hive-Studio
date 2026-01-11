// src/lib/hive.js

export const hasKeychain = () => {
  return !!window.hive_keychain;
};

// 1. LOGIN
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

// 2. PUBLISH (Simplified - No Beneficiary)
export const publishPost = (username, title, body, tags) => {
  return new Promise((resolve, reject) => {
    if (!hasKeychain()) return reject(new Error("Keychain missing"));

    const permlink = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') 
      .replace(/\s+/g, '-')         
      + '-' + Date.now();           

    // The Main Post Operation
    const postOp = [
      "comment",
      {
        parent_author: "", 
        parent_permlink: tags[0] || "hive", 
        author: username,
        permlink: permlink,
        title: title,
        body: body,
        json_metadata: JSON.stringify({
          tags: tags,
          app: "hive-studio/1.0",
          format: "html"
        })
      }
    ];

    // REMOVED: The optionsOp (Beneficiary) is gone.
    // We only send [postOp] now.

    window.hive_keychain.requestBroadcast(
      username,
      [postOp], // <--- Sending only the post, no options
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