$(document).ready(function(){
  $("p").on("mouseover mouseout",function(){
    $("p").toggleClass("intro");//该方法检查每个元素中指定的类。如果不存在则添加类，如果已设置则删除之。这就是所谓的切换效果
  });
});


// jquery 一个对象可以同时绑定多个事件吗？如何实现？
①$(document).ready(function() {
  $("button").bind({
      click: function() {
          $("p").slideToggle()
      },
      mouseover: function() {
          $("body").css("background-color", "red");
      },
      mouseout: function() {
          $("body").css("background-color", "#fffffff")
      };
  });
});

②$(function() {    $('#btn').bind("click",
  function() {
      $("#test").append("<p>我的绑定函数1</p>");
  })，bind("click",
  function() {
      $("#test").append("<p>我的绑定函数2</p>");
  }),
  bind("click",
  function() {
      $("#test").append("<p>我的绑定函数3</p>")
  });
});

③为元素一次性绑定多个事件类型$(function() {    $("div").bind("mouseover mouseout",
  function() {
      $(this).toggleClass("over");
  });
});
