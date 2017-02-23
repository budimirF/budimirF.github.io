angular.module('rssReader').factory('sidebarService', ['dashboardService', function(dashboardService) {
    var listFeeds = dashboardService.getListFeeds();

    function getCategorySidebar(listFeeds) {
        var listFeedSidebar = [];
        var listWork = [];
        var foundElem;

        if (!listFeeds.length) {
            return false;
        } else {
            listFeeds.forEach(function(element, index) {
                listWork.push({
                    // feedId: element._id,
                    feedCategory: element.feedCategory,
                    id: index,
                    // feedTitle: [element.feedTitle] //change to array objects - > [{feedTitle: element.feedTitle, feedId: element._id}]
                    feedTitle: [{feedTitle: element.feedTitle, feedId: element._id}]
                })
            });
        }

        listWork.forEach(function(element, index) {

            foundElem = listFeedSidebar.find(function(elem) {
                return elem.feedCategory == element.feedCategory;
            });

            if (foundElem) {
                foundElem.feedTitle = foundElem.feedTitle.concat(element.feedTitle);
            } else {
                listFeedSidebar.push(element);
            }
        });
        return listFeedSidebar;
    }
    return {
        getCategorySidebar: getCategorySidebar
    }
}])
