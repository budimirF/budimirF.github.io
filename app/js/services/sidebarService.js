angular.module('rssReader').factory('sidebarService', ['dashboardService', function(dashboardService) {
    'use strict';
    var listFeeds = [];


    function setListFeeds(arr) {

        if (!listFeeds.length) {
            listFeeds = listFeeds.concat(arr);
        } else {
            arr.forEach(element => {
                if (!(listFeeds.some(currentElem => currentElem._id === element._id))) {
                    listFeeds = listFeeds.concat(element);
                }
            });
        }
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
                    feedTitle: [{ feedTitle: element.feedTitle, feedId: element._id }]
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

    function getListFeeds() {
        return listFeeds;
    }
    return {
        getCategorySidebar: getCategorySidebar,
        setListFeeds: setListFeeds,
        getListFeeds: getListFeeds
    }
}])
