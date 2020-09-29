const getTwitterService = function () {
    const consumerKey = PropertiesService.getScriptProperties().getProperty("TWITTER_CONSUMER_KEY");
    const consumerSecret = PropertiesService.getScriptProperties().getProperty("TWITTER_CONSUMER_SECRET");
    const accessToken = PropertiesService.getScriptProperties().getProperty("TWITTER_ACCESS_TOKEN");
    const accessTokenSecret = PropertiesService.getScriptProperties().getProperty("TWITTER_ACCESS_TOKEN_SECRET");
    return OAuth1.createService("Twitter")
        .setAccessTokenUrl("https://api.twitter.com/oauth/access_token")
        .setRequestTokenUrl("https://api.twitter.com/oauth/request_token")
        .setAuthorizationUrl("https://api.twitter.com/oauth/authorize")
        .setConsumerKey(consumerKey)
        .setConsumerSecret(consumerSecret)
        .setAccessToken(accessToken, accessTokenSecret);
};

const myFunction = function () {
    const service = getTwitterService();

    // 1. accessToken発行者Twitterアカウントのタイムラインより直近のツイートをしたTwitterアカウントを抽出
    const homeTimeline = service.fetch("https://api.twitter.com/1.1/statuses/home_timeline.json", {method: "GET"});
    const homeTimelineJson = JSON.parse(homeTimeline.getContentText());
    const homeTimelineUsers = homeTimelineJson.map(function (tweet) {
        return tweet.user;
    });
    const homeTimelineUser = homeTimelineUsers[0];

    // 2. 1のフォロワーリストを抽出し、特定キーワードを持つTwitterアカウントで選別
    const followersList = service.fetch("https://api.twitter.com/1.1/followers/list.json?screen_name=" + homeTimelineUser.screen_name, {method: "GET"});
    const followersListJson = JSON.parse(followersList.getContentText()).users;
    const keywords = [
        "react",
        "vue",
        "angular",
        "next",
        "nuxt",
        "nest",
        "node.js",
        "javascript",
        "typescript",
        "frontend",
        "フロントエンド",
        "backend",
        "バックエンド",
        "serverside",
        "サーバーサイド",
        "clientside",
        "クライアントサイド",
        "プログラミング",
        "program",
        "vim",
        "emacs",
        "it",
        "エンジニア",
        "engineer",
        "component",
        "flutter",
        "コンポーネント",
        "AWS",
        "GCP",
        "インフラ",
        "infra",
        "コンテナ",
        "container",
        "docker",
        "k8s",
        "kubernetes",
        "terraform",
        "ansible",
        "Cloudformation",
        "severless",
        "python",
        "flask",
        "golang",
        "rust",
        "kotlin",
        "swift",
        "ruby",
        "github",
        "php",
        "developer",
        "application",
        "アプリケーション",
        "system",
        "システム",
        "vr",
        "ar",
        "unity",
        "sier",
        "ergodox",
        "自作キーボード",
        "フリーランス",
        "se",
        "html",
        "css",
        "atcoder",
        "java",
        "laravel",
        "ネットワーク",
        "サーバー",
        "perl",
        "go",
        "sql",
        "tdd",
        "テスト",
        "test"
    ];
    const myName = PropertiesService.getScriptProperties().getProperty("TWITTER_MY_NAME");
    const followersForMyTopic = followersListJson.filter(function (user) {
        Logger.log(user.description);
        return user.description.match(new RegExp("(" + keywords.join("|") + ")", "ig")) !== null　&& user.screen_name != myName
    });
    const screenNames = followersForMyTopic.map(function (follower) {
        return follower.screen_name
    }).join(",");
    Logger.log(screenNames);

    // 3. 2が互いにフォローしていない関係であるか判定
    const friendshipsLookup = service.fetch("https://api.twitter.com/1.1/friendships/lookup.json?screen_name=" + screenNames, {method: "GET"});
    const friendshipsLookupJson = JSON.parse(friendshipsLookup.getContentText())
    const willFollowList = friendshipsLookupJson.filter(function (friend) {
        Logger.log(friend);
        return friend.connections.indexOf("followed_by") == -1 && friend.connections.indexOf("following") == -1  // フォローしてもされてもいない
    }).map(function (friend) {
        return friend.screen_name;
    });
    Logger.log(willFollowList);

    // 4. 3で判定可となるTwitterアカウントをフォロー
    const maxFriendshipsCreatePosts = 10;
    willFollowList.map(function (screenName, index) {
        if (index + 1 > maxFriendshipsCreatePosts) {
            Logger.log("over 10 posts by friendships/create.json");
            return;
        }
        Logger.log("friendships/create.json :" + screenName + ", index:" + index);
        service.fetch("https://api.twitter.com/1.1/friendships/create.json?screen_name=" + screenName + "&follow=false", {method: "POST"});
    });
};
