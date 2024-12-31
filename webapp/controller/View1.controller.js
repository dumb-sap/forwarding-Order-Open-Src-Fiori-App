sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Message",
    "sap/ui/core/Fragment"
], function (Controller, MessageToast, MessageBox, Message, Fragment) {
    "use strict";

    return Controller.extend("forwardingorder.controller.View1", {
        onInit: function () {
            // Attach a keydown event handler to the view
            this.getView().attachBrowserEvent("keydown", this.onKeyDown.bind(this));
            // Attach the liveChange event to the FO Type field to monitor user changes
            var oFOTypeInput = this.getView().byId("_IDGenInput3");
            oFOTypeInput.attachLiveChange(this.onFOTypeChange.bind(this));
        },

        onFOTypeChange: function (oEvent) {
            var sValue = oEvent.getParameter("value");

            // If the FO Type is cleared, clear the related fields and make them editable again
            if (!sValue) {
                this._clearDependentFields();
            }
        },

        _clearDependentFields: function () {
            // Clear and reset the dependent fields for Mode of Transport, Shipping Type, etc.
            this._resetField("descriptionText"); //FO Type
            this._resetField("_IDGenInput6"); // Mode of Transport (MOT)
            this._resetField("descTextMot"); // MOT Desc
            this._resetField("_IDGenInput8"); // Shipping Type
            this._resetField("descTextShipType"); // Shipping Type Desc
            this._resetField("_IDGenInput11"); // Sales Org
            this._resetField("descTextSalesOrg"); // Sales Org Desc
            this._resetField("_IDGenInput13"); // Sales Group
            this._resetField("descTextSalesGrp"); // Sales Group Desc
            this._resetField("_IDGenInput9"); // Traffic Direction
            this._resetField("descTextTrfDir"); // Traffic Direction Desc
        },

        _resetField: function (sInputId) {
            var oControl = this.getView().byId(sInputId);

            if (oControl instanceof sap.m.Input) {
                // Clear the input field value and make it editable
                oControl.setValue("");
                oControl.setEditable(true);
            } else if (oControl instanceof sap.m.Text) {
                // Clear the text field value
                oControl.setText("");
            }
        },


        onContinue: function () {
            var oView = this.getView();
            var sTRQType = oView.byId("_IDGenInput3").getValue();
            var sMOT = oView.byId("_IDGenInput6").getValue();
            var sTrafficDir = oView.byId("_IDGenInput9").getValue();
            var sShippingType = oView.byId("_IDGenInput8").getValue();
            var sMovType = oView.byId("_IDGenInput10").getValue();
            var sSalesOrg = oView.byId("_IDGenInput11").getValue();
            var sSalesGrp = oView.byId("_IDGenInput13").getValue();
            var sTrqTypeDesc = oView.byId("descriptionText").getText();
            var sMotDesc = oView.byId("descTextMot").getText();
            var sTrfDirDesc = oView.byId("descTextTrfDir").getText();
            var sShipTypeDesc = oView.byId("descTextShipType").getText();
            var sMovTypeDesc = oView.byId("descTextMovType").getText();
            var sSalesOrgDesc = oView.byId("descTextSalesOrg").getText();
            var sSalesOffDesc = oView.byId("descTextSalesOff").getText();
            var sSalesGrpDesc = oView.byId("descTextSalesGrp").getText();

            var oData = {
                TRQ_TYPE: sTRQType,
                MOT: sMOT,
                TRAFFIC_DIRECT: sTrafficDir,
                SHIPPING_TYPE: sShippingType,
                MOVEM_TYPE: sMovType,
                SALES_ORG_ID: sSalesOrg,
                SALES_GRP_ID: sSalesGrp,
                TRQ_TYPE_DESC: sTrqTypeDesc,
                descTextMot: sMotDesc,
                descTextTrfDir: sTrfDirDesc,
                descTextShipType: sShipTypeDesc,
                descTextMovType: sMovTypeDesc,
                descTextSalesOrg: sSalesOrgDesc,
                descTextSalesOff: sSalesOffDesc,
                descTextSalesGrp: sSalesGrpDesc

            };

            // Set this data into the sharedData model
            this.getOwnerComponent().getModel("sharedData").setData(oData);

            // Proceed with navigation to View2
            this.getOwnerComponent().getRouter().navTo("RouteView2", {
                TRQ_TYPE: sTRQType || " FWO",
                MOT: sMOT || " ",// Use empty space if MOT is not provided
                TRAFFIC_DIRECT: sTrafficDir || " ",
                SHIPPING_TYPE: sShippingType || " ",
                MOVEM_TYPE: sMovType || " ",
                SALES_ORG_ID: sSalesOrg || " ",
                SALES_GRP_ID: sSalesGrp || " "
            });


        },

        onKeyDown: function (oEvent) {
            if (oEvent.key === "Enter") {
                var oView = this.getView();
                var sTRQType = oView.byId("_IDGenInput3").getValue();

                // If TRQ_TYPE is empty, navigate without validation
                if (!sTRQType) {
                    this.onContinue(); // Proceed to View 2 where you can set the default FO type
                } else {
                    // Call validation for TRQ Type if not empty
                    this._validateTrqType(sTRQType).then(function (isValid) {
                        if (isValid) {
                            this.onContinue();
                        } else {
                            sap.m.MessageBox.error("Invalid Forwarding Order Type. Please enter a valid value.");
                        }
                    }.bind(this)).catch(function (error) {
                        // Handle any potential errors during validation
                        sap.m.MessageBox.error("Error occurred during validation: " + error.message);
                    });
                }
            }
        },

        oPopupSupplier: null,
        onValHelpforTrqType: function () {
            var oView = this.getView();
            var oModel = oView.getModel(); // Ensure the OData model is set to the view

            if (!this.oPopupSupplier) {
                Fragment.load({
                    name: "forwardingorder.fragments.trqTypeSH",
                    controller: this
                }).then(function (oFragment) {
                    this.oPopupSupplier = oFragment;
                    oView.addDependent(this.oPopupSupplier);
                    this.oPopupSupplier.setModel(oModel); // Set the OData model to the dialog
                    this.oPopupSupplier.open();
                }.bind(this)); // Bind the context to "this"
            } else {
                this.oPopupSupplier.open();
            }
        },

        handleTableValueHelpConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext();
                var sSelectedType = oContext.getProperty("Type");
                var sDescription = oContext.getProperty("DescriptionS");

                var oInput = this.getView().byId("_IDGenInput3");
                oInput.setValue(sSelectedType);

                // Set the description in the Text control
                var oDescriptionText = this.getView().byId("descriptionText");
                oDescriptionText.setText(sDescription);

                // Fetch additional data and set fields
                var oView = this.getView();
                var TrMode = oContext.getProperty("TrMode");
                this._setFieldData("_IDGenInput6", TrMode); // Mode of Transport (MOT)
                var TrModeDesc = oContext.getProperty("TrModeDesc");
                this._setFieldData("descTextMot", TrModeDesc); // MOT Desc
                var ShippingType = oContext.getProperty("ShippingType");
                this._setFieldData("_IDGenInput8", ShippingType); // Shipping Type               
                var ShpTypeDesc = oContext.getProperty("ShpTypDesc");
                this._setFieldData("descTextShipType", ShpTypeDesc); // Shipping Type Desc
                var SalesOrg = oContext.getProperty("SalesOrg");
                this._setFieldData("_IDGenInput11", SalesOrg); // Sales Org
                var SalesOrgDesc = oContext.getProperty("SalesOrgDesc");
                this._setFieldData("descTextSalesOrg", SalesOrgDesc); // Sales Org Desc
                var SalesGrp = oContext.getProperty("SalesGrp");
                this._setFieldData("_IDGenInput13", SalesGrp); // Sales Group
                var SalesGrpDesc = oContext.getProperty("SalesGrpDesc");
                this._setFieldData("descTextSalesGrp", SalesGrpDesc); // Sales Group Desc
                var TrafficDir = oContext.getProperty("TrafficDir");
                this._setFieldData("_IDGenInput9", TrafficDir); // Traffic Direction

                // Traffic Direction Description
                var sTrafficDesc = "";
                if (TrafficDir === "1") {
                    sTrafficDesc = "Export";
                } else if (TrafficDir === "2") {
                    sTrafficDesc = "Import";
                } else if (TrafficDir === "3") {
                    sTrafficDesc = "Transit";
                }

                // Set the Traffic Direction description in the relevant field
                this._setFieldData("descTextTrfDir", sTrafficDesc);
            }
        },


        // Function to validate TRQ Type by querying the OData service
        _validateTrqType: function (sSelectedType) {
            var oModel = this.getView().getModel(); // Assuming default OData model
            var sPath = "/ZtmShTrqFwoTypeSet('" + sSelectedType + "')"; // Adjust entity set path accordingly

            return new Promise(function (resolve, reject) {
                oModel.read(sPath, {
                    success: function (oData) {
                        // TRQ Type exists
                        resolve(true);
                    },
                    error: function () {
                        // TRQ Type does not exist or there was an error
                        resolve(false);
                    }
                });
            });
        },

        _setFieldData: function (sInputId, sValue) {
            var oControl = this.getView().byId(sInputId);

            if (oControl instanceof sap.m.Input) {
                // It's an Input field
                oControl.setValue(sValue);

                // Set the field as non-editable if it has a value
                if (sValue) {
                    oControl.setEditable(false);
                } else {
                    oControl.setEditable(true); // Keep editable if there is no value
                }
            } else if (oControl instanceof sap.m.Text) {
                // It's a Text field
                oControl.setText(sValue);
            }
        },

        // Value Help for Transportation Mode (MOT)
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

                var oInput = this.getView().byId("_IDGenInput6");
                oInput.setValue(sSelectedTypeMot);

                // Set the description in the Text control
                var oDescriptionText = this.getView().byId("descTextMot");
                oDescriptionText.setText(sDescMot);
            }
        },

        oPopupSalesOrg: null,
        onValHelpforSalesOrg: function () {
            var oView = this.getView();
            var oModel = oView.getModel(); // Ensure the OData model is set to the view

            if (!this.oPopupSalesOrg) {
                Fragment.load({
                    name: "forwardingorder.fragments.SalesOrgSH",
                    controller: this
                }).then(function (oFragment) {
                    this.oPopupSalesOrg = oFragment;
                    oView.addDependent(this.oPopupSalesOrg);
                    this.oPopupSalesOrg.setModel(oModel); // Set the OData model to the dialog
                    this.oPopupSalesOrg.open();
                }.bind(this)); // Bind the context to "this"
            } else {
                this.oPopupSalesOrg.open();
            }
        },

        handleSalesOrgValueHelp: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var oContextSalesOrg = oSelectedItem.getBindingContext();
                var sSelectedOrg = oContextSalesOrg.getProperty("ExternalId");
                var sDescOrg = oContextSalesOrg.getProperty("Descr40");

                var oInput = this.getView().byId("_IDGenInput11");
                oInput.setValue(sSelectedOrg);

                // Set the description in the Text control
                var oDescriptionText = this.getView().byId("descTextSalesOrg");
                oDescriptionText.setText(sDescOrg);
            }
        },

        oPopupSalesOff: null,
        onValHelpforSalesOff: function () {
            var oView = this.getView();
            var oModel = oView.getModel(); // Ensure the OData model is set to the view

            if (!this.oPopupSalesOff) {
                Fragment.load({
                    name: "forwardingorder.fragments.SalesOffSH",
                    controller: this
                }).then(function (oFragment) {
                    this.oPopupSalesOff = oFragment;
                    oView.addDependent(this.oPopupSalesOff);
                    this.oPopupSalesOff.setModel(oModel); // Set the OData model to the dialog
                    this.oPopupSalesOff.open();
                }.bind(this)); // Bind the context to "this"
            } else {
                this.oPopupSalesOff.open();
            }
        },

        handleSalesOffValueHelp: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var oContextSalesOff = oSelectedItem.getBindingContext();
                var sSelectedOff = oContextSalesOff.getProperty("ExternalId");
                var sDescOff = oContextSalesOff.getProperty("Descr40");

                var oInput = this.getView().byId("_IDGenInput12");
                oInput.setValue(sSelectedOff);

                // Set the description in the Text control
                var oDescriptionText = this.getView().byId("descTextSalesOff");
                oDescriptionText.setText(sDescOff);
            }
        },

        oPopupSalesGrp: null,
        onValHelpforSalesGrp: function () {
            var oView = this.getView();
            var oModel = oView.getModel(); // Ensure the OData model is set to the view

            if (!this.oPopupSalesGrp) {
                Fragment.load({
                    name: "forwardingorder.fragments.SalesGrpSH",
                    controller: this
                }).then(function (oFragment) {
                    this.oPopupSalesGrp = oFragment;
                    oView.addDependent(this.oPopupSalesGrp);
                    this.oPopupSalesGrp.setModel(oModel); // Set the OData model to the dialog
                    this.oPopupSalesGrp.open();
                }.bind(this)); // Bind the context to "this"
            } else {
                this.oPopupSalesGrp.open();
            }
        },

        handleSalesGrpValueHelp: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var oContextSalesGrp = oSelectedItem.getBindingContext();
                var sSelectedGrp = oContextSalesGrp.getProperty("ExternalId");
                var sDescGrp = oContextSalesGrp.getProperty("Descr40");

                var oInput = this.getView().byId("_IDGenInput13");
                oInput.setValue(sSelectedGrp);

                // Set the description in the Text control
                var oDescriptionText = this.getView().byId("descTextSalesGrp");
                oDescriptionText.setText(sDescGrp);
            }
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

                var oInput = this.getView().byId("_IDGenInput10");
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

                var oInput = this.getView().byId("_IDGenInput8");
                oInput.setValue(sSelectedShipType);

                // Set the description in the Text control
                var oDescriptionText = this.getView().byId("descTextShipType");
                oDescriptionText.setText(sDescShipType);
                var oInputMot = this.getView().byId("_IDGenInput6"); // Replace with your Mot field ID
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
                var oInputField = this.getView().byId("_IDGenInput9"); // Input field ID
                oInputField.setValue(sSelectedCode); // Set the selected Traffic Direction code

                // Set the description in the corresponding Text field
                var oTextField = this.getView().byId("descTextTrfDir"); // Text field ID
                oTextField.setText(sSelectedTitle); // Set the selected Traffic Direction title
            }
        },

        handleSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("value"); // Get the search query entered by the user

            var oFilter = [];

            // Check if there is a query entered
            if (sQuery && sQuery.length > 0) {
                // Create a filter for the FO Type and Description fields (if you want to search by both fields)
                var oFilter1 = new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.Contains, sQuery);
                var oFilter2 = new sap.ui.model.Filter("DescriptionS", sap.ui.model.FilterOperator.Contains, sQuery);

                // Combine the filters with an OR condition
                oFilter = new sap.ui.model.Filter({
                    filters: [oFilter1, oFilter2],
                    and: false
                });
            }

            // Get the binding of the items in the SelectDialog
            var oBinding = oEvent.getSource().getBinding("items");

            // Apply the filter to the binding
            oBinding.filter(oFilter);
        },


    });
});
