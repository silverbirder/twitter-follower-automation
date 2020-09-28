var getTwitterService = function () {
    var consumerKey = PropertiesService.getScriptProperties().getProperty("TWITTER_CONSUMER_KEY");
    var consumerSecret = PropertiesService.getScriptProperties().getProperty("TWITTER_CONSUMER_SECRET");
    var accessToken = PropertiesService.getScriptProperties().getProperty("TWITTER_ACCESS_TOKEN");
    var accessTokenSecret = PropertiesService.getScriptProperties().getProperty("TWITTER_ACCESS_TOKEN_SECRET");
    return OAuth1.createService("Twitter")
        .setAccessTokenUrl("https://api.twitter.com/oauth/access_token")
        .setRequestTokenUrl("https://api.twitter.com/oauth/request_token")
        .setAuthorizationUrl("https://api.twitter.com/oauth/authorize")
        .setConsumerKey(consumerKey)
        .setConsumerSecret(consumerSecret)
        .setAccessToken(accessToken, accessTokenSecret);
};

var myFunction = function() {
    var service = getTwitterService();

    var homeTimeline = service.fetch("https://api.twitter.com/1.1/statuses/home_timeline.json", { method:"GET" });
    var homeTimelineJson = JSON.parse(homeTimeline.getContentText())
    var homeTimelineUsers = homeTimelineJson.map(function(tweet){
        return tweet.user;
    })
    var homeTimelineUser = homeTimelineUsers[0];
    var followersList = service.fetch("https://api.twitter.com/1.1/followers/list.json?screen_name="+homeTimelineUser.screen_name, { method:"GET" });
    var followersListJson = JSON.parse(followersList.getContentText()).users;
    var keywords = [
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
    ];
    var followersForMyTopic = followersListJson.filter(function(user){
        Logger.log(user.description);
        return user.description.match(new RegExp("("+keywords.join("|")+")", "ig")) !== null
    })

    var screenNames = followersForMyTopic.map(function(follower){
        return follower.screen_name
    }).join(",")
    Logger.log(screenNames);
    var friendshipsLookup = service.fetch("https://api.twitter.com/1.1/friendships/lookup.json?screen_name="+screenNames, { method:"GET" });
    var friendshipsLookupJson = JSON.parse(friendshipsLookup.getContentText())
    var willFollowList = friendshipsLookupJson.filter(function(friend){
        Logger.log(friend);
        return friend.connections.indexOf("followed_by") == -1 && friend.connections.indexOf("following") == -1  // フォローしてもされてもいない
    }).map(function(friend){
        return friend.screen_name;
    });
    Logger.log(willFollowList);

    var maxFriendshipsCreatePosts = 10;

    willFollowList.map(function(screenName, index){
        if(index+1 > maxFriendshipsCreatePosts) {
            Logger.log("over 10 posts by friendships/create.json");
            return;
        }
        Logger.log("friendships/create.json :" + screenName + ", index:" + index);
        service.fetch("https://api.twitter.com/1.1/friendships/create.json?screen_name="+screenName+"&follow=false", { method:"POST" });
    });
}
