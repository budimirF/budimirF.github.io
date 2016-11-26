(function() {
    $('#sidebarMenu').click(function(event) {
        var target = event.target,
            span = $(target).hasClass("chevronRotate"),
            parentSpan = $(target).children().hasClass("chevronRotate");

        if (parentSpan) {
            $(target).children().toggleClass('chevronRotated');
        }
        if (span) {
            $(target).toggleClass('chevronRotated');
        }
    });

})();
