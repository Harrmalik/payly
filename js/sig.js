var topazSig_tmr = '';
var topazSig_activeCanvas = '';
function activateSigPad(canvasId){
	if(document.getElementById(canvasId)){
		if(checkSignaturePad("alert")){
			if(topazSig_activeCanvas != ""){
				deactivateSigPad(topazSig_activeCanvas, true);
			}

			var canvas = $("#" + canvasId);

			//run the deactivator first.  This will in turn, instantiate the canvas
			deactivateSigPad(canvasId);
			$(canvas).addClass('activeCanvas');

			topazSig_activeCanvas = canvasId;

			var canvasData = canvasId.split("_");
			var componentId = canvasData[canvasData.length-1];

			$("#btnSigContainerStop").removeClass();
			$("#btnSigContainerStop").show();
			$("#btnSigContainerStart").hide();

			var ctx = document.getElementById(canvasId).getContext('2d');
			var height = document.getElementById(canvasId).height;
			var width = document.getElementById(canvasId).width;
			SetDisplayXSize( width );
			SetDisplayYSize( height );
			SetJustifyMode(0);
			ClearTablet();
			//SetTabletState(1, ctx, 50);
			topazSig_tmr = SetTabletState(1, ctx, 50) || topazSig_tmr;
		}
	}else { console.log("element does not exist: " + canvasId);}
}

function deactivateSigPad(canvasId, disableForm){
	/*
   if(NumberOfTabletPoints() == 0)
   {
      alert("Please sign before continuing");
   }
   else
   {
   	*/
		var canvas = $("#" + canvasId);
		$(canvas).removeClass('activeCanvas');

		var canvasData = canvasId.split("_");
		var componentId = canvasData[canvasData.length-1];

		$("#btnSigContainerStart_" + componentId).show();
		$("#btnSigContainerStop_" + componentId).hide();

		SetTabletState(0, topazSig_tmr);
		//RETURN TOPAZ-FORMAT SIGSTRING
		SetSigCompressionMode(1);

		var sigString = GetSigString();
		$('[name="bioSigData"]').val(sigString);
		$("#sigStringData").val( $("#sigStringData_" + componentId).val() + sigString);

		//document.FORM1.bioSigData.value=GetSigString();
		//document.FORM1.sigStringData.value += GetSigString();
		//this returns the signature in Topaz's own format, with biometric information


		//RETURN BMP BYTE ARRAY CONVERTED TO BASE64 STRING
		SetImageXSize(500);
		SetImageYSize(100);
		SetImagePenWidth(5);
		GetSigImageB64(GetSigImageB64Callback);

		// determine if the form needs to be disabled
		if(disableForm){
			formReactfromSignature();
		}
   //}
}

function GetSigImageB64Callback(str){
	var canvasData = topazSig_activeCanvas.split("_");
	var componentId = canvasData[canvasData.length-1];

	$("#componentEntry_" + componentId).val(str);
	$("#sigImgData_" + componentId).val(str);
}

function checkSignaturePad(msgType){
	var isConnected = false;
	if(msgType == ""){
		msgType = "msg";
	}

	try {
		var signaturePadTest = parseInt(TabletConnectQuery());
		
		if(signaturePadTest <= 0){
			if(msgType == 'msg'){
				$('#msg').removeClass();
				$('#msg').addClass("bg-danger text-center");
				$('#msg').html("<h3>Cannot communicate with the signature pad.</h3>");
				$('#msg').show();
			} else if(msgType == 'alert') {
				alert("Cannot communicate with the signature pad.");
			}
		} else {
			isConnected = true;

			$('#msg').removeClass();
			$('#msg').html("");
			$('#msg').hide();
		}
	}
	catch(err) {
		$('#msg').removeClass();
		$('#msg').addClass("bg-danger text-center");
		$('#msg').html("<h3>Cannot communicate with the signature pad services.</h3>");
		$('#msg').show();
	}

	return isConnected;
}