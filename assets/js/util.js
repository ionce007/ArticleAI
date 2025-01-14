function maskTips(msg){  
	var m = document.createElement('div');  
	m.setAttribute('data-backdrop', 'true');
	m.setAttribute("data-bs-toggle","modal");
	m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(23,114,246,0.1);z-index:999999999;pointer-events:none;overflow:hidden;'
	m.innerHTML = `<div style='font-size: 16px;color: rgb(255, 255, 255);background-color: rgba(0, 0, 0, 0.6);padding: 10px 15px;transform: translate(-50%, -50%);/*margin: 0 0 0 -60px;*/border-radius: 4px;position: fixed;top: 50%;left: 50%;min-width:300px;text-align: center;'>${msg}</div>`
	//m.innerHTML = msg;  
	//m.style.cssText="font-size: 16px;color: rgb(255, 255, 255);background-color: rgba(0, 0, 0, 0.6);padding: 10px 15px;transform: translate(-50%, -50%);/*margin: 0 0 0 -60px;*/border-radius: 4px;position: fixed;top: 50%;left: 50%;min-width:300px;text-align: center;";
	document.body.appendChild(m);  
	return m;
  } 
function Tips(msg){  
	var m = document.createElement('div');  
	m.innerHTML = msg;  
	m.style.cssText="font-size: 16px;color: rgb(255, 255, 255);background-color: rgba(0, 0, 0, 0.6);padding: 10px 15px;transform: translate(-50%, -50%);/*margin: 0 0 0 -60px;*/border-radius: 4px;position: fixed;top: 50%;left: 50%;min-width:300px;text-align: center;";
	document.body.appendChild(m);  
	return m;
  }  
  function removeTips(tip){
	var d = 0.5;
	tip.style.opacity = '0';  
	setTimeout(function() { document.body.removeChild(tip) }, d * 1000);  
  }