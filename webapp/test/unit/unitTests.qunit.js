/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"forwarding_order/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
