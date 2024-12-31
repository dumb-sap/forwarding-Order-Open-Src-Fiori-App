sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/core/Fragment"
],
    function (Controller, MessageToast, Dialog, Button, Text, Fragment) {
        "use strict";

        return Controller.extend("forwardingorder.controller.View2", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);

                // Initialize a separate JSON model for items, this won't interfere with the existing data model
                var oItemModel = new sap.ui.model.json.JSONModel({
                    HeaderToItem: [] // Initially an empty array
                });

                // Set this model to the view with a different name
                oItemModel.setDefaultBindingMode("TwoWay"); // Set binding mode
                this.getView().setModel(oItemModel, "itemModel");


            },

            _onObjectMatched: function () {
                // Get data from the sharedData model instead of route parameters
                var oSharedData = this.getOwnerComponent().getModel("sharedData").getData();

                // Now you can use the data in View2
                var sTRQType = oSharedData.TRQ_TYPE || "FWO"; // Set default TRQ_TYPE if not provided
                var sMOT = oSharedData.MOT || "";
                var sMotDesc = oSharedData.descTextMot || "";
                var sTrafficDir = oSharedData.TRAFFIC_DIRECT || "";
                var sTrfDirDesc = oSharedData.descTextTrfDir || "";
                var sShippingType = oSharedData.SHIPPING_TYPE || "";
                var sShipTypeDesc = oSharedData.descTextShipType || "";
                var sMovType = oSharedData.MOVEM_TYPE || "";
                var sMovTypeDesc = oSharedData.descTextMovType || "";
                var sSalesOrg = oSharedData.SALES_ORG_ID || "";
                var sSalesOrgDesc = oSharedData.descTextSalesGrp || "";
                var sSalesGrp = oSharedData.SALES_GRP_ID || "";
                var sTrqTypeDesc = oSharedData.TRQ_TYPE_DESC || "Forwarding Order";


                // Set the retrieved values to the respective fields in View2
                this.getView().byId("TRQ_TYPE").setValue(sTRQType);
                this.getView().byId("descTextTrqType").setText(sTrqTypeDesc);
                this.getView().byId("MOT").setValue(sMOT);
                this.getView().byId("descTextMot").setText(sMotDesc);
                this.getView().byId("TRAFFIC_DIRECT").setValue(sTrafficDir);
                this.getView().byId("descTextTrfDir").setText(sTrfDirDesc);
                this.getView().byId("MOVEM_TYPE").setValue(sMovType);
                this.getView().byId("descTextMovType").setText(sMovTypeDesc);
                this.getView().byId("SALES_ORG_ID").setValue(sSalesOrg);
                this.getView().byId("descTextSalesOrg").setText(sSalesOrgDesc);
                this.getView().byId("SHIPPING_TYPE").setValue(sShippingType);
                this.getView().byId("descTextShipType").setText(sShipTypeDesc);
                this.getView().byId("LIFECYCLE").setValue("New"); // Set the default lifecycle value

                // Disable fields if they have values
                this._setFieldsEditable(false);
            },

            onSavePress: function () {
                // Collect data from input fields
                var oView = this.getView();
                var sLifecycleDisplayValue = oView.byId("LIFECYCLE").getValue();
                var sLifecyclePayloadValue = sLifecycleDisplayValue === "New" ? "01" : sLifecycleDisplayValue;

                // Convert date fields
                var sPIC_EAR_REQ = oView.byId("PIC_EAR_REQ").getValue();
                var sPIC_EAR_CNF = oView.byId("PIC_EAR_CNF").getValue();
                var sDEL_LAT_REQ = oView.byId("DEL_LAT_REQ").getValue();
                var sDEL_LAT_CNF = oView.byId("DEL_LAT_CNF").getValue();
                var sConvertedPIC_EAR_REQ = this.convertToAbapTimestamp(sPIC_EAR_REQ);
                var sConvertedPIC_EAR_CNF = this.convertToAbapTimestamp(sPIC_EAR_CNF);
                var sConvertedDEL_LAT_REQ = this.convertToAbapTimestamp(sDEL_LAT_REQ);
                var sConvertedDEL_LAT_CNF = this.convertToAbapTimestamp(sDEL_LAT_CNF);

                // Collect items data from the table
                var oTable = oView.byId("itemTable");
                var aItems = [];

                oTable.getItems().forEach(function (oTableItem) {
                    var oCells = oTableItem.getCells();
                    var oItem = {
                        //ITEM_ID: oCells[0].getValue(),
                        ITEM_CAT: oCells[1].getValue(),
                        ITEM_DESCR: oCells[2].getValue(),
                        PRODUCT_ID: oCells[3].getValue(),
                        //PRODUCT_DESC: oCells[4].getValue(),
                        QUA_PCS_VAL: oCells[5].getValue(),
                        QUA_PCS_UNI: oCells[6].getValue(),
                        GRO_WEI_VAL: oCells[7].getValue(),
                        GRO_WEI_UNI: oCells[8].getValue(),
                        GRO_VOL_VAL: oCells[9].getValue(),
                        GRO_VOL_UNI: oCells[10].getValue()
                    };
                    aItems.push(oItem);
                });

                var oPayload = {
                    TRQ_ID: oView.byId("TRQ_ID").getValue(),
                    TRQ_TYPE: oView.byId("TRQ_TYPE").getValue(),
                    SALES_ORG_ID: oView.byId("SALES_ORG_ID").getValue(),
                    LIFECYCLE: sLifecyclePayloadValue,
                    MOT: oView.byId("MOT").getValue(),
                    TRAFFIC_DIRECT: oView.byId("TRAFFIC_DIRECT").getValue(),
                    SHIPPING_TYPE: oView.byId("SHIPPING_TYPE").getValue(),
                    MOVEM_TYPE: oView.byId("MOVEM_TYPE").getValue(),
                    ORDER_PARTY_ID: oView.byId("ORDER_PARTY_ID").getValue(),
                    SHIPPER_ID: oView.byId("SHIPPER_ID").getValue(),
                    CONSIGNEE_ID: oView.byId("CONSIGNEE_ID").getValue(),
                    SRC_LOC_ID: oView.byId("SRC_LOC_ID").getValue(),
                    SRC_LOC_UNLOCODE: oView.byId("SRC_LOC_UNLOCODE").getValue(),
                    PIC_EAR_REQ: sConvertedPIC_EAR_REQ,  // Converted ABAP timestamp
                    PIC_EAR_CNF: sConvertedPIC_EAR_CNF,  // Converted ABAP timestamp
                    DES_LOC_ID: oView.byId("DEST_LOC_ID").getValue(),
                    DES_LOC_UNLOCODE: oView.byId("DEST_LOC_UNLOCODE").getValue(),
                    DEL_LAT_REQ: sConvertedDEL_LAT_REQ,  // Converted ABAP timestamp
                    DEL_LAT_CNF: sConvertedDEL_LAT_CNF,  // Converted ABAP timestamp
                    NOTES: oView.byId("NOTES").getValue(),
                    HeaderToItem: aItems //Items Array
                };

                // Perform the create operation
                this.getView().getModel().create("/FrwHeaderSet", oPayload, {
                    method: "POST",
                    success: function (data) {
                        var sDocumentNo = data.TRQ_ID.replace(/^0+/, '');
                        MessageToast.show('Forwarding Order ' + sDocumentNo + ' Created Successfully');
                        this.disableFields(); // Disable fields after successful creation
                        this.updateTitleWithDocumentNo(sDocumentNo);
                    }.bind(this),

                    error: function (data) {
                        MessageToast.show('Forwarding Order Creation Failed');
                    },
                });
            },

            disableFields: function () {
                var oView = this.getView();
                var aFields = [
                    "TRQ_ID", "TRQ_TYPE", "SALES_ORG_ID", "LIFECYCLE", "MOT",
                    "TRAFFIC_DIRECT", "SHIPPING_TYPE", "MOVEM_TYPE", "ORDER_PARTY_ID",
                    "SHIPPER_ID", "CONSIGNEE_ID", "SRC_LOC_ID", "SRC_LOC_UNLOCODE",
                    "PIC_EAR_REQ", "PIC_EAR_CNF", "DEST_LOC_ID", "DEST_LOC_UNLOCODE",
                    "DEL_LAT_REQ", "DEL_LAT_CNF", "NOTES",
                    "SRC_STREET", "SRC_POST_CODE", "SRC_CITY", "SRC_REGION",
                    "SRC_COUNTRY", "DEST_STREET", "DEST_POST_CODE", "DEST_CITY",
                    "DEST_REGION", "DEST_COUNTRY"
                ];

                aFields.forEach(function (sFieldId) {
                    var oField = oView.byId(sFieldId);
                    if (oField) {
                        oField.setEditable(false);
                    }
                });
            },

            updateTitleWithDocumentNo: function (sDocumentNo) {
                var oView = this.getView();
                var oPage = oView.byId("_IDGenPage1");

                if (oPage) {
                    var sNewTitle = oPage.getTitle().replace("Forwarding Order $", "Forwarding Order " + sDocumentNo);
                    oPage.setTitle(sNewTitle);
                }
            },

            onBackPress: function () {
                var oRouter = this.getOwnerComponent().getRouter();

                // Show confirmation dialog
                var oDialog = new Dialog({
                    title: 'Confirm',
                    type: 'Message',
                    content: new Text({ text: 'Are you sure you want to cancel the activity?' }),
                    beginButton: new Button({
                        text: 'Yes',
                        type: "Reject",
                        press: function () {
                            // Reset fields and navigate back to View1
                            this.resetFields();

                            oRouter.navTo("RouteView1", {}, true /*no history*/);
                            // Directly reset the title here
                            var oPage = this.getView().byId("_IDGenPage1");
                            if (oPage) {
                                oPage.setTitle("Forwarding Order $");
                            }
                            oDialog.close();
                        }.bind(this),
                    }),
                    endButton: new Button({
                        text: 'No',
                        press: function () {
                            oDialog.close();
                        }
                    }),
                    afterClose: function () {
                        oDialog.destroy();
                    }
                });

                oDialog.open();
            },

            resetFields: function () {
                var oView = this.getView();

                // Fields to reset
                var aFields = [
                    "TRQ_TYPE", "SALES_ORG_ID", "MOT", "TRAFFIC_DIRECT", "SHIPPING_TYPE", "MOVEM_TYPE", "ORDER_PARTY_ID",
                    "SHIPPER_ID", "CONSIGNEE_ID", "SRC_LOC_ID", "SRC_LOC_UNLOCODE", "PIC_EAR_REQ", "PIC_EAR_CNF", "DEST_LOC_ID",
                    "DEST_LOC_UNLOCODE", "DEL_LAT_REQ", "DEL_LAT_CNF", "NOTES", "SRC_STREET", "SRC_HOUSE_NO", "DEST_CITY",
                    "DEST_REGION", "DEST_COUNTRY", "SRC_POST_CODE", "SRC_CITY", "SRC_REGION", "SRC_COUNTRY", "DEST_STREET",
                    "DEST_HOUSE_NO", "DEST_POST_CODE"
                ];

                var aNonEditableFields = [
                    "DEST_CITY", "DEST_REGION", "DEST_COUNTRY", "DEST_HOUSE_NO", "DEST_POST_CODE",
                    "SRC_POST_CODE", "SRC_CITY", "SRC_REGION", "SRC_COUNTRY", "DEST_STREET",

                ];

                // Fields that are text controls
                var aTextFields = [
                    "DESTLocDesc", "DESTCountryDesc", "DESTRegionDesc", "SRCCountryDesc", "SRCRegionDesc", "SRCLocDesc"
                ];

                // Reset input fields
                aFields.forEach(function (sFieldId) {
                    var oField = oView.byId(sFieldId);
                    if (oField) {
                        if (oField.setValue) {
                            oField.setValue(""); // Reset value for input fields
                        }
                        if (aNonEditableFields.indexOf(sFieldId) === -1) {
                            oField.setEditable(true); // Set editable for fields that should be editable
                        }
                    }
                });

                // Reset text fields
                aTextFields.forEach(function (sFieldId) {
                    var oTextField = oView.byId(sFieldId);
                    if (oTextField) {
                        oTextField.setText(""); // Reset text for text fields
                    }
                });

                // Set lifecycle back to "New"
                oView.byId("LIFECYCLE").setValue("New");
            },

            // resetFields: function () {
            //     var oView = this.getView();
            //     var aFields = [
            //         "TRQ_TYPE", "SALES_ORG_ID", , "MOT",
            //         "TRAFFIC_DIRECT", "SHIPPING_TYPE", "MOVEM_TYPE", "ORDER_PARTY_ID",
            //         "SHIPPER_ID", "CONSIGNEE_ID", "SRC_LOC_ID", "SRC_LOC_UNLOCODE",
            //         "PIC_EAR_REQ", "PIC_EAR_CNF", "DEST_LOC_ID", "DEST_LOC_UNLOCODE",
            //         "DEL_LAT_REQ", "DEL_LAT_CNF", "NOTES","SRC_STREET","SRC_HOUSE_NO","SRC_POST_CODE",
            //         "SRC_CITY","SRC_REGION",
            //     ];
            //     aFields.forEach(function (sFieldId) {
            //         var oField = oView.byId(sFieldId);
            //         if (oField) {
            //             oField.setValue(""); // Reset value
            //             oField.setEditable(true); // Set editable
            //         }
            //     });
            //     oView.byId("LIFECYCLE").setValue("New"); // Reset lifecycle to "New"
            // },

            _setFieldsEditable: function (bEditable) {
                var oView = this.getView();
                var aFields = [
                    "TRQ_TYPE", "MOT", "TRAFFIC_DIRECT", "MOVEM_TYPE", "SALES_ORG_ID", "SHIPPING_TYPE"
                ];
                aFields.forEach(function (sFieldId) {
                    var oField = oView.byId(sFieldId);
                    if (oField) {
                        // Check if the field has a value
                        var sValue = oField.getValue();
                        if (sValue && sValue.trim() !== "") {
                            oField.setEditable(bEditable);
                        }
                    }
                });
            },

            convertToAbapTimestamp: function (dateTimeStr) {
                if (!dateTimeStr) {
                    return ""; // Return empty string if no date is provided
                }
                var date = new Date(dateTimeStr);
                if (isNaN(date.getTime())) {
                    return ""; // Return empty string if invalid date
                }
                var year = date.getFullYear();
                var month = ('0' + (date.getMonth() + 1)).slice(-2);
                var day = ('0' + date.getDate()).slice(-2);
                var hours = ('0' + date.getHours()).slice(-2);
                var minutes = ('0' + date.getMinutes()).slice(-2);
                var seconds = ('0' + date.getSeconds()).slice(-2);

                return `${year}${month}${day}${hours}${minutes}${seconds}`;
            },

            oPopupLoc: null,
            onValHelpforLoc: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel();
                var locType = oEvent.getSource().getId().includes("SRC") ? "SRC" : "DEST"; // Check if it is Source or Destination

                if (!this.oPopupLoc) {
                    Fragment.load({
                        name: "forwardingorder.fragments.LocSH",
                        controller: this
                    }).then(function (oFragment) {
                        this.oPopupLoc = oFragment;
                        oView.addDependent(this.oPopupLoc);
                        this.oPopupLoc.setModel(oModel);
                        this.oPopupLoc.open();
                    }.bind(this));
                } else {
                    this.oPopupLoc.open();
                }

                // Store the location type (SRC or DEST) in a variable
                this.locType = locType;
            },

            handleLocValueHelp: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    var oContextLoc = oSelectedItem.getBindingContext();
                    var locType = this.locType;  // Use the stored location type

                    // Call the reusable function for Source or Destination location
                    this.setLocationFields(locType, oContextLoc);
                }
            },

            setLocationFields: function (locType, oContextLoc) {
                // Extract location details from the context
                var sLocId = oContextLoc.getProperty("LocId");
                var sLocDesc = oContextLoc.getProperty("LocDesc");
                var sStreet = oContextLoc.getProperty("Street");
                var sCity = oContextLoc.getProperty("City");
                var sHouseNo = oContextLoc.getProperty("HouseNo");
                var sPostCode = oContextLoc.getProperty("PostCode");
                var sCountry = oContextLoc.getProperty("Country");
                var sCountryDesc = oContextLoc.getProperty("CountryDesc");
                var sRegion = oContextLoc.getProperty("Region");
                var sRegionDesc = oContextLoc.getProperty("RegionDesc");

                // Dynamically build field IDs based on locType (SRC for Source, DEST for Destination)
                var oView = this.getView();

                var oLocIdInput = oView.byId(locType + "_LOC_ID");
                oLocIdInput.setValue(sLocId);

                var oLocDescText = oView.byId(locType + "LocDesc");
                oLocDescText.setText(sLocDesc);

                var oStreetInput = oView.byId(locType + "_STREET");
                oStreetInput.setValue(sStreet);

                var oHouseNoInput = oView.byId(locType + "_HOUSE_NO");
                oHouseNoInput.setValue(sHouseNo);

                var oPostCodeInput = oView.byId(locType + "_POST_CODE");
                oPostCodeInput.setValue(sPostCode);

                var oCityInput = oView.byId(locType + "_CITY");
                oCityInput.setValue(sCity);

                var oRegionInput = oView.byId(locType + "_REGION");
                oRegionInput.setValue(sRegion);

                var oRegionDesc = oView.byId(locType + "RegionDesc");
                oRegionDesc.setText(sRegionDesc);

                var oCountryInput = oView.byId(locType + "_COUNTRY");
                oCountryInput.setValue(sCountry);

                var oCountryDesc = oView.byId(locType + "CountryDesc");
                oCountryDesc.setText(sCountryDesc);
            },

            oPopupMovType: null,
            onValHelpforMovType: function () {
                var oView = this.getView();
                var oModel = oView.getModel(); // Ensure the OData model is set to the view

                if (!this.oPopupMovType) {
                    Fragment.load({
                        name: "forwardingorder.fragments.MovTypeSH",
                        controller: this
                    }).then(function (oFragment) {
                        this.oPopupMovType = oFragment;
                        oView.addDependent(this.oPopupMovType);
                        this.oPopupMovType.setModel(oModel); // Set the OData model to the dialog
                        this.oPopupMovType.open();
                    }.bind(this)); // Bind the context to "this"
                } else {
                    this.oPopupMovType.open();
                }
            },

            handleMovTypeValueHelp: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    var oContextMovType = oSelectedItem.getBindingContext();
                    var sSelectedMovType = oContextMovType.getProperty("MovemType");
                    var sDescMovType = oContextMovType.getProperty("DescriptionS");

                    var oInput = this.getView().byId("MOVEM_TYPE");
                    oInput.setValue(sSelectedMovType);

                    // Set the description in the Text control
                    var oDescriptionText = this.getView().byId("descTextMovType");
                    oDescriptionText.setText(sDescMovType);
                }
            },

            oPopupShipType: null,
            onValHelpforShiptype: function () {
                var oView = this.getView();
                var oModel = oView.getModel(); // Ensure the OData model is set to the view

                if (!this.oPopupShipType) {
                    Fragment.load({
                        name: "forwardingorder.fragments.ShipTypeSH",
                        controller: this
                    }).then(function (oFragment) {
                        this.oPopupShipType = oFragment;
                        oView.addDependent(this.oPopupShipType);
                        this.oPopupShipType.setModel(oModel); // Set the OData model to the dialog
                        this.oPopupShipType.open();
                    }.bind(this)); // Bind the context to "this"
                } else {
                    this.oPopupShipType.open();
                }
            },

            handleShipTypeValueHelp: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    var oContextShipType = oSelectedItem.getBindingContext();
                    var sSelectedShipType = oContextShipType.getProperty("ShippingType");
                    var sDescShipType = oContextShipType.getProperty("Text");
                    var sMot = oContextShipType.getProperty("Mot");
                    var sMotDesc = oContextShipType.getProperty("MotDesc");

                    var oInput = this.getView().byId("SHIPPING_TYPE");
                    oInput.setValue(sSelectedShipType);

                    // Set the description in the Text control
                    var oDescriptionText = this.getView().byId("descTextShipType");
                    oDescriptionText.setText(sDescShipType);
                    var oInputMot = this.getView().byId("MOT"); // Replace with Mot field ID
                    if (oInputMot) {
                        oInputMot.setValue(sMot); // Set the Mot value
                    }
                    // Set the Mot description in the MOT description Text control
                    var oDescriptionMotText = this.getView().byId("descTextMot"); // Assuming this is your MOT description Text field
                    if (oDescriptionMotText) {
                        oDescriptionMotText.setText(sMotDesc); // Set the MotDesc (Mot description)
                    }
                }
            },

            onValHelpforTrfDir: function () {
                var oView = this.getView();

                if (!this.oTrafficDirectionDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "forwardingorder.fragments.TrfDirSH",
                        controller: this
                    }).then(function (oDialog) {
                        this.oTrafficDirectionDialog = oDialog;
                        oView.addDependent(this.oTrafficDirectionDialog);

                        // Hardcoded Traffic Direction values
                        var aTrafficDirection = [
                            { code: "1", title: "Export" },
                            { code: "2", title: "Import" },
                            { code: "3", title: "Transit" }
                        ];

                        // Set model to the fragment
                        var oModel = new sap.ui.model.json.JSONModel();
                        oModel.setData({ TrafficDirection: aTrafficDirection });
                        this.oTrafficDirectionDialog.setModel(oModel, "trafficDirection");

                        // Bind aggregation to the SelectDialog
                        this.oTrafficDirectionDialog.bindAggregation("items", {
                            path: "trafficDirection>/TrafficDirection",
                            template: new sap.m.StandardListItem({
                                title: "{trafficDirection>title}",
                                description: "{trafficDirection>code}"
                            })
                        });

                        this.oTrafficDirectionDialog.open();
                    }.bind(this));
                } else {
                    this.oTrafficDirectionDialog.open();
                }
            },

            handleTrfDirValueHelp: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");

                if (oSelectedItem) {
                    // Get the selected Traffic Direction title and code
                    var sSelectedTitle = oSelectedItem.getTitle();
                    var sSelectedCode = oSelectedItem.getDescription();

                    // Set the selected value in the Traffic Direction input field
                    var oInputField = this.getView().byId("TRAFFIC_DIRECT"); // Input field ID
                    oInputField.setValue(sSelectedCode); // Set the selected Traffic Direction code

                    // Set the description in the corresponding Text field
                    var oTextField = this.getView().byId("descTextTrfDir"); // Text field ID
                    oTextField.setText(sSelectedTitle); // Set the selected Traffic Direction title
                }
            },

            oPopupMot: null,
            onValHelpforMot: function () {
                var oView = this.getView();
                var oModel = oView.getModel(); // Ensure the OData model is set to the view

                if (!this.oPopupMot) {
                    Fragment.load({
                        name: "forwardingorder.fragments.motSH", // this is the fragment name
                        controller: this
                    }).then(function (oFragment) {
                        this.oPopupMot = oFragment;
                        oView.addDependent(this.oPopupMot);
                        this.oPopupMot.setModel(oModel); // Set the OData model to the dialog
                        this.oPopupMot.open();
                    }.bind(this));
                } else {
                    this.oPopupMot.open();
                }
            },

            handleMotValueHelpConfirm: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    var oContextMOT = oSelectedItem.getBindingContext();
                    var sSelectedTypeMot = oContextMOT.getProperty("Vktra");
                    var sDescMot = oContextMOT.getProperty("Bezei");

                    var oInput = this.getView().byId("MOT");
                    oInput.setValue(sSelectedTypeMot);

                    // Set the description in the Text control
                    var oDescriptionText = this.getView().byId("descTextMot");
                    oDescriptionText.setText(sDescMot);
                }
            },


            oPopupPrd: null,
            onValHelpforPrd: function () {
                var oView = this.getView();
                var oModel = oView.getModel(); // Ensure the OData model is set to the view

                if (!this.oPopupPrd) {
                    Fragment.load({
                        name: "forwardingorder.fragments.PrdSH", // this is the fragment name
                        controller: this
                    }).then(function (oFragment) {
                        this.oPopupPrd = oFragment;
                        oView.addDependent(this.oPopupPrd);
                        this.oPopupPrd.setModel(oModel); // Set the OData model to the dialog
                        this.oPopupPrd.open();
                    }.bind(this));
                } else {
                    this.oPopupPrd.open();
                }
            },


            // handlePrdValueHelp: function (oEvent) {
            //     var oSelectedItem = oEvent.getParameter("selectedItem");
            //     if (!oSelectedItem) {
            //         return; // Exit if no item was selected
            //     }

            //     var sProductId = oSelectedItem.getBindingContext().getProperty("PRODUCT_ID");
            //     var sProductDesc = oSelectedItem.getBindingContext().getProperty("PRODUCT_DESC");

            //     // Assuming you have some way to determine which row should be updated
            //     // For example, you could have a variable that stores the row index or ID
            //     var sRowPath = this._sRowPathToUpdate; // Set this value when initiating value help

            //     if (sRowPath) {
            //         var oModel = this.getView().getModel("itemModel");
            //         var oData = oModel.getProperty(sRowPath);

            //         if (oData) {
            //             oData.PRODUCT_ID = sProductId;
            //             oData.PRODUCT_DESC = sProductDesc;

            //             // Update the model
            //             oModel.refresh(true);
            //         }
            //     }
            // },


            handlePrdValueHelp: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");

                if (oSelectedItem) {
                    var oContextPrd = oSelectedItem.getBindingContext();
                    var sSelectedTypePrd = oContextPrd.getProperty("Matnr");
                    var sDescPrd = oContextPrd.getProperty("Maktg");

                    // Get the context of the current table row to update the model
                    var oTable = this.getView().byId("itemTable");
                    var oBindingContext = oTable.getBindingContext("itemModel");

                    if (sSelectedTypePrd || sDescPrd) {
                        // Update the model for the current row
                        var oModel = this.getView().getModel("itemModel");

                        if (oBindingContext) {
                            var sPath = oBindingContext.getPath(); // Get the path to the current row
                            oModel.setProperty(sPath + "/PRODUCT_ID", sSelectedTypePrd);
                            oModel.setProperty(sPath + "/PRODUCT_DESC", sDescPrd);
                        }

                        // Alternatively, update the first item if the binding context is not working
                        var aItems = oModel.getProperty("/HeaderToItem");
                        aItems[0].PRODUCT_ID = sSelectedTypePrd;
                        aItems[0].PRODUCT_DESC = sDescPrd;
                        oModel.setProperty("/HeaderToItem", aItems);
                    }
                }
            },

            onAddItem: function (oEvent) {
                // Get the "itemModel"
                var oItemModel = this.getView().getModel("itemModel");
                var aItems = oItemModel.getProperty("/HeaderToItem");
                var oComboBox = oEvent.getSource(); // Get the ComboBox that triggered the event
                var sSelectedKey = oComboBox.getSelectedKey();

                // Determine item category based on the selected key
                var sItemCategory = "";
                if (sSelectedKey === "Product") {
                    sItemCategory = "PRD";
                } else if (sSelectedKey === "Package") {
                    sItemCategory = "PKG";
                } else {
                    sItemCategory = ""; // or handle as needed
                }

                // Get the next item ID
                var iNextItemID = (aItems.length + 1) * 10; // Incremental ID logic

                // Create a new empty item
                var oNewItem = {
                    ITEM_ID: iNextItemID.toString(),
                    ITEM_CAT: sItemCategory,
                    ITEM_DESCR: "",
                    PRODUCT_ID: "",
                    QUA_PCS_VAL: "",
                    QUA_PCS_UNI: "",
                    GRO_WEI_VAL: "",
                    GRO_WEI_UNI: "",
                    GRO_VOL_VAL: "",
                    GRO_VOL_UNI: ""
                };

                // Create a copy of the items array and add the new item
                var aNewItems = aItems.slice(); // Create a copy
                aNewItems.push(oNewItem); // Add the new item

                // Update the model
                oItemModel.setProperty("/HeaderToItem", aNewItems);

                // Refresh Table Binding
                var oTable = this.getView().byId("itemTable");
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.refresh(); // Force table to refresh
                }

                // Clear the ComboBox selection
                oComboBox.setSelectedKey(null);
            },

            onDeleteItem: function () {
                var oTable = this.getView().byId("itemTable");
                var aSelectedItems = oTable.getSelectedItems();

                if (aSelectedItems.length === 0) {
                    sap.m.MessageToast.show("Please select an item to delete");
                    return;
                }

                var oItemModel = this.getView().getModel("itemModel");
                var aItems = oItemModel.getProperty("/HeaderToItem");

                // Collect indices to delete
                var aIndicesToDelete = aSelectedItems.map(function (oSelectedItem) {
                    var oContext = oSelectedItem.getBindingContext("itemModel");
                    return parseInt(oContext.getPath().split("/").pop(), 10);
                });

                // Sort indices in descending order to delete from the end to avoid shifting issues
                aIndicesToDelete.sort(function (a, b) { return b - a; });

                // Delete items from the end to the beginning
                aIndicesToDelete.forEach(function (iIndex) {
                    aItems.splice(iIndex, 1);
                });

                // Update the model
                oItemModel.setProperty("/HeaderToItem", aItems);

                // Clear table selection
                oTable.removeSelections();
            }

        });
    });
