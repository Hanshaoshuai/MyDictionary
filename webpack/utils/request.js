

export default function Ajax(type,url,data){
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: type,
      url: url,
      async: true,
      data: data ? data : {},
      dataType: "json",
      success: (res) => {
        resolve(res);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}
