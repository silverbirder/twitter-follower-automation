const spreadSheetId = scriptProperties.getProperty("SPREAD_SHEET_ID");
const spreadsheet = SpreadsheetApp.openById(spreadSheetId);
const sheet = spreadsheet.getSheetByName('main');

const setSpreadSheet = function(screenName) {
    const screenNameValues = sheet.getRange('A:A').getValues();
    const LastRow = screenNameValues.filter(String).length + 1;
    sheet.getRange('A'+LastRow).setValue(screenName);
    sheet.getRange('B'+LastRow).setValue(new Date());
    sheet.getRange('C'+LastRow).setValue("following");
    sheet.getRange('D'+LastRow).setValue("FALSE");
}

const updateSpreadSheet = function() {
    const service = getTwitterService();
    const screenNameValues = sheet.getRange('D:D').getValues();
    const lastCheckedRow = screenNameValues.filter(function(v){
        return v.toString() === "true"
    }).length + 1 + 1; // 1: header, 1:next row
    var now = new Date();
    var beforeNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    beforeNow.setDate(beforeNow.getDate() - 14);  // 14日前にフォローしたアカウントのみ

    var currentRow = lastCheckedRow
    var counter = 0;
    var targets = [];
    while(true) {
        const lastCheckedDate = sheet.getRange('B'+currentRow).getValue();
        if (lastCheckedDate == "") {
            Logger.log("lastCheckedDate is empty string");
            break;
        }
        if (lastCheckedDate >= beforeNow) {
            Logger.log("lastCheckedDate >= beforeNow");
            Logger.log(lastCheckedDate);
            Logger.log(beforeNow);
            break;
        }
        if(counter >= 10) {
            Logger.log("max count");
            break;
        }
        const screenName = sheet.getRange('A'+currentRow).getValue();;
        targets.push({"row": currentRow, "screenName": screenName});
        counter += 1;
        currentRow += 1;
    }
    const screenNames = targets.map(function(target){
        return target.screenName;
    }).join(',');

    Logger.log(screenNames);
    Logger.log(targets);
    const friendshipsLookup = service.fetch("https://api.twitter.com/1.1/friendships/lookup.json?screen_name=" + screenNames, {method: "GET"});
    const friendshipsLookupJson = JSON.parse(friendshipsLookup.getContentText())
    const friendshipList = friendshipsLookupJson.map(function (friend) {
        Logger.log(friend);
        const screenName = friend.screen_name;
        let connections = friend.connections;
        // フォローされていなければ、アンフォローする
        if (connections.indexOf("followed_by") == -1) {
            Logger.log("unfollow "+ screenName)
            service.fetch("https://api.twitter.com/1.1/friendships/destroy.json?screen_name=" + screenName, {method: "POST"});
            connections = [];
        }
        return {screenName: screenName, connections: connections};
    }).map(function(friend) {
        Logger.log(friend);
        const screenName = friend.screenName;
        const target = targets.find(function(target){
            return target.screenName == screenName;
        })
        const row = target.row;
        sheet.getRange("C"+row).setValue(friend.connections.join(","))
        sheet.getRange("D"+row).setValue("TRUE")
    });
}
