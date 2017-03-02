angular.module('rssReader').factory('sidebarService', ['dashboardService', function(dashboardService) {
    var listFeeds = [];


    function setListFeeds (arr) {
        listFeeds = listFeeds.concat(arr);
    }

    function getCategorySidebar(listFeeds) {
        var listFeedSidebar = [];
        var listWork = [];
        var foundElem;

        if (!listFeeds.length) {
            return false;
        } else {
            listFeeds.forEach(function(element, index) {
                listWork.push({
                    feedCategory: element.feedCategory,
                    id: index,
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

    function getListFeeds () {
        return listFeeds;
    }
    return {
        getCategorySidebar: getCategorySidebar,
        setListFeeds: setListFeeds,
        getListFeeds: getListFeeds
    }
}])
