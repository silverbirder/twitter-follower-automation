var getTwitterService = function () {
    return OAuth1.createService("Twitter")
        .setAccessTokenUrl("https://api.twitter.com/oauth/access_token")
        .setRequestTokenUrl("https://api.twitter.com/oauth/request_token")
        .setAuthorizationUrl("https://api.twitter.com/oauth/authorize")
        .setConsumerKey("")
        .setConsumerSecret("")
        .setAccessToken("", "");
};

var myFunction = function() {
    var service = getTwitterService();
    // var res = service.fetch("https://api.twitter.com/1.1/friendships/create.json?screen_name=.....&follow=true", { method:"POST" });
    var res = service.fetch("https://api.twitter.com/1.1/statuses/home_timeline.json", { method:"GET" });
    var result = JSON.parse(res.getContentText())
    var usr = {'id': result[0].user.id_str, 'screen_name': result[0].user.screen_name}
    // https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-home_timeline
    // → 自分のタイムラインにおけるuser.screen_name のフォロワー で 特定トピックを持つユーザーを フォローする。
    // https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-followers-list
    var r = service.fetch("https://api.twitter.com/1.1/followers/list.json?screen_name=" + result[0].user.screen_name, { method:"GET" });
    var result2 = JSON.parse(r.getContentText())
    var usr2 = result2.users
    Logger.log(usr2[0].screen_name);
    Logger.log(usr2[0].description);
    // screen_name のfollower list が取得できる。それぞれはUserObject。
    // https://developer.twitter.com/en/docs/twitter-api/v1/data-dictionary/overview/user-object
    // => description が特定トピックを持つ screen_name をfollow する。
    // Twitter　フォローは一日最大400まで。が、150ぐらいを目安にしたほうがよい。解除は、どうなんだろう。

    // https://matome.naver.jp/odai/2136085696920497901 一日最大 300までフォロー？ フォローする感覚を1時間ほど開けれるのが良いかも。
    /*
    １日最大300人までしかフォロー解除しないこと。
    できればフォローした数と同じか少し多い程度に留めた方が無難。
    一括フォロー解除は数回に分けて行いましょう。
    １回の一括フォロー解除は最大50人まで。（一気に何百人もフォロー解除してはいけません）
    */
}
