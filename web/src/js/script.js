

		function drawCanvasBase(gauge) {
		gauge.clearRect(0, 0, W, H);
		gauge.beginPath();
		gauge.strokeStyle = "#d7d7d7";
		gauge.lineWidth = 27;
		gauge.arc(W/2, H/2, 55, 0, Math.PI*2, false);
		gauge.stroke();
	}
	function drawCanvasStaff(gauge,arcEndStaff,color_gauge) {
		gauge.clearRect(0, 0, W, H);
		gauge.beginPath();
		gauge.strokeStyle = "#d7d7d7";
		gauge.lineWidth = 27;
		gauge.arc(W/2, H/2, 55, 0, Math.PI*2, false);
		gauge.stroke();

		//CHANGE RADIUS TO COORDONATE WITH GROWCIRCLE (PROGRESS CIRCLE)
		gauge.beginPath();
		gauge.strokeStyle = color_gauge;
		gauge.lineWidth = 27;
		gauge.arc(W/2,H/2, 55, 0 - 90*Math.PI/180 , arcEndStaff - 90*Math.PI/180, false);
		gauge.stroke();

		gauge.fillStyle = "#000000";
		gauge.font = "1.0em CenturyGothicBold";
		var text = Math.floor(arcEndStaff/6.2*100) + "%";
		var text_width = gauge.measureText(text).width;
		gauge.fillText(text, W/2 - text_width/2, H/2 + 5);

		return arcEndStaff;
	}
	