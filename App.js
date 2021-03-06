Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    _testCaseRecord: null,

    launch: function() {
        Ext.create('Rally.data.wsapi.Store', {
            model: 'TestCase',
            autoLoad: true,
            listeners: {
                load: this._onDataLoaded,
                scope: this
            }
        });
    },

    _onDataLoaded: function(store, data) {
        var me = this;
        var records = [];
        Ext.Array.each(data, function(record) {
            records.push({
                _ref: record.get('_ref'),
                ObjectID: record.get('ObjectID'),
                FormattedID: record.get('FormattedID'),
                Name: record.get('Name'),
                Type: record.get('Type'),
                Priority: record.get('Priority'),
                Project: record.get('Project')
            });
        });

        this.add({
            xtype: 'rallygrid',
            store: Ext.create('Rally.data.custom.Store', {
                data: records,
                pageSize: 50
            }),
            columnCfgs: [
                {
                    text: 'FormattedID', dataIndex: 'FormattedID',
                    xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Name', dataIndex: 'Name', flex: 1
                },
                {
                    text: 'Type', dataIndex: 'Type'
                },
                {
                    text: 'Priority', dataIndex: 'Priority'
                },
                {
                    text: 'Add Result',
                    renderer: function (value, model, record) {
                        var id = Ext.id();
                        Ext.defer(function () {
                            Ext.widget('button', {
                                renderTo: id,
                                text: 'Add TCR',
                                width: 100,
                                handler: function () {
                                    me._addTestCaseResult(record.data);
                                }
                            });
                        }, 50);
                        return Ext.String.format('<div id="{0}"></div>', id);
                    }
                }
            ]
        });
    },

    _addTestCaseResult: function(testCaseRecord) {

        var me = this;
        me._testCaseRecord = testCaseRecord;

        var model = Rally.data.ModelFactory.getModel({
            type: 'TestCaseResult',
            success: function(model) {
                me._openEditor(model);
            },
            scope: this
        });

    },

    _openEditor: function(testCaseModel) {

        var me = this;

        var params = {
            defaultName: "TestCaseResult",
            typeDef: testCaseModel.typeDefOid,
            testCaseOid: me._testCaseRecord.ObjectID,
            cpoid: me._testCaseRecord.Project.ObjectID
        };

        Rally.nav.Manager.create('TestCaseResult', params);
    }
});