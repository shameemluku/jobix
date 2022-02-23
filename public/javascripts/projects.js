! function() {
    var t = {
            611: function() {
                ! function(t) {
                    const e = t("#tabs-section .tab-link"),
                        r = t("#tabs-section .tab-body");
                    let n;
                    const o = () => {
                        e.off("click").on("click", (function(o) {
                            o.preventDefault(), o.stopPropagation(), window.clearTimeout(n), e.removeClass("active "), r.removeClass("active "), r.removeClass("active-content"), t(this).addClass("active"), t(t(this).attr("href")).addClass("active"), n = setTimeout((() => {
                                t(t(this).attr("href")).addClass("active-content")
                            }), 50)
                        }))
                    };
                    t((function() {
                        o()
                    }))
                }(jQuery)
            },
            221: function(t, e, r) {
                "use strict";
                t.exports = r.p + "css/style.css"
            }
        },
        e = {};

    function r(n) {
        var o = e[n];
        if (void 0 !== o) return o.exports;
        var i = e[n] = {
            exports: {}
        };
        return t[n](i, i.exports, r), i.exports
    }
    r.n = function(t) {
            var e = t && t.__esModule ? function() {
                return t.default
            } : function() {
                return t
            };
            return r.d(e, {
                a: e
            }), e
        }, r.d = function(t, e) {
            for (var n in e) r.o(e, n) && !r.o(t, n) && Object.defineProperty(t, n, {
                enumerable: !0,
                get: e[n]
            })
        }, r.g = function() {
            if ("object" == typeof globalThis) return globalThis;
            try {
                return this || new Function("return this")()
            } catch (t) {
                if ("object" == typeof window) return window
            }
        }(), r.o = function(t, e) {
            return Object.prototype.hasOwnProperty.call(t, e)
        },
        function() {
            var t;
            r.g.importScripts && (t = r.g.location + "");
            var e = r.g.document;
            if (!t && e && (e.currentScript && (t = e.currentScript.src), !t)) {
                var n = e.getElementsByTagName("script");
                n.length && (t = n[n.length - 1].src)
            }
            if (!t) throw new Error("Automatic publicPath is not supported in this browser");
            t = t.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/"), r.p = t + "../"
        }(),
        function() {
            "use strict";
            r(221), r(611)
        }()
}();

$(document).ready(function() {

    $("#chatList").scrollTop($("#chatList")[0].scrollHeight);
    
})


$("#send-msg-Form").submit(function(e) {

    e.preventDefault()
    
    var form = $(this);
    message = $('#msgTxt').val()

    $.ajax({
        type: "POST",
        url: '/send-message',
        data: form.serialize(), 
        success: function(data)
        {
          if(data.status){
            html = '<li class="self"> <div class="avatar"><img src="/images/site/default.jpg" draggable="false"/></div><div class="msg"><p>'+message+'<emoji class="suffocated"/></p><time>20:18</time></div></li>'
            document.getElementById("chatList").innerHTML = document.getElementById("chatList").innerHTML + html;

           
            $('#chatList').animate({scrollTop: $('#chatList').prop("scrollHeight")}, 500);
            $('#msgTxt').val("")
          }
        }
    });

})