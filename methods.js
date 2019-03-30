import { Pivot, Tweak, TweakCheck, PathDown, PathUp } from './pivot.js';

var Model = {};
export const Methods = {
    Init: (inModel)=>
    {
        Model = inModel;
        var i, j;
        var indicies;
        var index, row, cell;
        indicies = Methods.GetColumnIndicies(Model.Sums);
        for(i=0; i<indicies.length; i++)
        {
            index = indicies[i];
            for(j=0; j<Model.Rows.length; j++)
            {
                row = Model.Rows[j];
                cell = row[index];
                row[index] = {Original:cell, Modified:cell, Epoch:0}
            }
        }
        Methods.FormPivotReset();
    },
    FormPivotReset: () =>
    {
        var form;
        form = Model.Form.Pivot;
        form.Open = Methods.GetColumnIndicies(Model.Pivots);
        form.Closed = [];
    },
    FormPivotUpdate: (inIndex) =>
    {
        var form;
        form = Model.Form.Pivot;
        form.Closed.push(form.Open.splice(inIndex, 1)[0]);
    },
    FormPivotSubmit: ()=>
    {
        var i;
        var joiner;
        var tree;
        var check;
        var against;

        joiner = "|>-";
        check = Model.Form.Pivot.Closed.join(joiner);
        for(i=0; i<Model.Trees.length; i++)
        {
            tree = Model.Trees[i];
            against = tree.Pivot.join(joiner);
            if(check == against)
            {
                Methods.FormPivotReset();
                Methods.PivotSelect(tree);
                return;
            }
        }
        Methods.PivotCreate(Model.Form.Pivot.Closed);
        Methods.FormPivotReset();
    },
    
    FormEditUpdate: (inTable, inSum)=>
    {
        var edit = Model.Form.Edit;
        edit.Table = inTable;
        edit.Sum = inSum;
        edit.Value = inSum.Local;
        console.log("value should be", edit.Value);
    },
    FormEditReset:()=>
    {
        Model.Form.Edit.Value = false;
    },
    FormEditSubmit: (inDelete)=>
    {
        var edit = Model.Form.Edit;
        if(inDelete)
        {
            Methods.EditDelete(edit.Table, edit.Sum.IndexSum);
        }
        else
        {
            Methods.EditCreate(edit.Table, edit.Sum.IndexSum, edit.Value);
        }
        edit.Value = false;
    },
    
    FormGoalUpdate: (inTable, inSum)=>
    {
        var goal = Model.Form.Goal;
        goal.Table = inTable;
        goal.Sum = inSum;
        goal.Value = inSum.Local;
        console.log("value should be", goal.Value);
    },
    FormGoalReset:()=>
    {
        Model.Form.Goal.Value = false;
    },
    FormGoalSubmit: (inDelete)=>
    {
        var goal = Model.Form.Goal;
        if(inDelete)
        {
            Methods.GoalDelete(goal.Table, goal.Sum.IndexSum);
        }
        else
        {
            Methods.GoalCreate(goal.Table, goal.Sum.IndexSum, goal.Value);
        }
        goal.Value = false;
    },
    
    InferTable: (inTree, inArray) =>
    {
        return PathDown(inTree.Root, inArray, 0);
    },
    InferColumn: (inTable, inKey) =>
    {
        var indexColumn;
        var i;
        var column;

        indexColumn = Methods.GetColumnIndex(inKey);
        for(i=0; i<inTable.Sums.length; i++)
        {
            column = inTable.Sums[i];
            if(column.IndexColumn == indexColumn)
            {
                return column;
            }
        }
        return false;
    },
    GetColumnKey:(inIndex)=>
    {
        return Model.Keys[inIndex];
    },
    GetColumnKeys:(inIndexArray)=>
    {
        var i;
        var output;
        output = [];
        for(i=0; i<inIndexArray.length; i++)
        {
            output[i] = Methods.GetColumnKey(inIndexArray[i]);
        }
        return output;
    },
    GetColumnIndex:(inKey)=>
    {
        var i;
        for(i=0; i<Model.Keys.length; i++)
        {
            if(Model.Keys[i] == inKey)
            {
                return i;
            }
        }
        return false;
    },
    GetColumnIndicies:(inKeyArray)=>
    {
        var i;
        var output;
        output = [];
        for(i=0; i<inKeyArray.length; i++)
        {
            output[i] = Methods.GetColumnIndex(inKeyArray[i]);
        }
        return output;
    },
    EditCreate: (inTable, inIndex, inAmount) =>
    {
        var i;
        Tweak(inTable, inIndex, inAmount);
        for(i=0; i<Model.Trees.length; i++)
        {
            if(Model.Trees[i] == Model.Active)
            {
                continue;
            }
            TweakCheck(Model.Trees[i].Root);
        }
        inTable.Sums[inIndex].HasEdit = true;
    },
    EditDelete: (inTable, inIndex)=>
    {
        Methods.EditCreate(inTable, inIndex, 1);
        inTable.Sums[inIndex].HasEdit = false;
    },
    GoalCreate: (inTable, inIndex, inAmount) =>
    {
        var column;
        column = inTable.Sums[inIndex];
        column.Goal = inAmount;
        column.HasGoal = true;
    },
    GoalDelete: (inTable, inIndex) =>
    {
        Methods.GoalCreate(inTable, inIndex, 0);
        inTable.Sums[inIndex].HasGoal = false;
    },
    PivotCreate: (inArray) =>
    {
        var i;
        var tree;
        tree = {
            Pivot: inArray,
            Root: Pivot(Model.Rows, inArray, Methods.GetColumnIndicies(Model.Sums))
        };
        TweakCheck(tree.Root);
        Model.Trees.push(tree);
        Model.Active = tree;
        
        return tree;
    },
    PivotSelect: (inPivot)=>
    {
        Model.Active = inPivot;
        
    },
    PivotDelete: (inPivot) =>
    {
        var i;
        for(i=0; i<Model.Trees.length; i++)
        {
            if(Model.Trees[i] == inPivot)
            {
                if(Model.Active == inPivot)
                {
                    Model.Active = false;
                }
                Model.Trees.splice(i, 1);
            }
        }
        
    },
    StatePivot: (inTable, inList) =>
    {
        var i;
        var sum;
        var outputTable;
        var outputColumn;

        outputTable = {
            Path:[],
            Columns:[]
        };
        for(i=0; i<inTable.Sums.length; i++)
        {
            outputColumn = {};
            sum = inTable.Sums[i];
            if(sum.Local != 1)
            {
                outputColumn.Column = sum.IndexColumn;
                outputColumn.Edit = sum.Local
            }
            if(sum.Goal != 0)
            {
                outputColumn.Column = sum.IndexColumn;
                outputColumn.Goal = sum.Goal;
            }
            if(outputColumn.Column > -1)
            {
                outputColumn.Column = Methods.GetColumnKey(outputColumn.Column);
                outputTable.Columns.push(outputColumn);
            }
        }
        if(outputTable.Columns.length != 0)
        {
            outputTable.Path = PathUp(inTable, []);
            outputTable.Path.shift();
            inList.push(outputTable);
        }
        for(i=0; i<inTable.Children.length; i++)
        {
            Methods.StatePivot(inTable.Children[i], inList);
        }
        return inList;
    },
    StateSave: () =>
    {
        var i;
        var output;
        var pivot;
        var tree;

        output = {
            Data:{
                Source:"",
                Destination:"",
            },
            Pivots:[]
        };

        for(i=0; i<Model.Trees.length; i++)
        {
            tree = Model.Trees[i];
            pivot = {
                Pivot:Methods.GetColumnKeys(tree.Pivot),
                Changes:Methods.StatePivot(tree.Root, []),
            };
            output.Pivots.push(pivot);
        }
        Model.History.unshift(output);
        
        return output;
    },
    StateLoad: (inState) => 
    {
        var i, j, k;
        var tree;
        var table;
        var column;
        var appTree;
        var appTable;
        var appColumn;

        Model.Trees = [];
        Model.Active = false;

        for(i=0; i<inState.Pivots.length; i++)
        {
            tree = inState.Pivots[i];
            appTree = Methods.PivotCreate(Methods.GetColumnIndicies(tree.Pivot));
            for(j=0; j<tree.Changes.length; j++)
            {
                table = tree.Changes[j];
                appTable = Methods.InferTable(appTree, table.Path);

                for(k=0; k<table.Columns.length; k++)
                {
                    column = table.Columns[k];
                    appColumn = Methods.InferColumn(appTable, column.Column);
                    if(column.Edit)
                    {
                        Methods.EditCreate(appTable, appColumn.IndexSum, column.Edit);
                    }
                    if(column.Goal)
                    {
                        Methods.GoalCreate(appTable, appColumn.IndexSum, column.Goal);
                    }
                }
            }
        }
    }
};