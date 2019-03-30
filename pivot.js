
export const Pivot = (inRows, inColumnsPivots, inColumnsSums) =>
{
    var root;
    root = Table("Root", false, inRows, inColumnsSums);
    PivotTree(root, inColumnsPivots, inColumnsSums);
    ProcessLeaves(root, SumValue);
    return root;
};
const PivotTree = (inTable, inColumns, inSums, inDepth) =>
{
    var i;
    var depth;
    
    depth = inDepth||0;
    inTable.Children = PivotTable(inTable, inColumns[depth], inSums);
    depth++;
    if(depth != inColumns.length)
    {
        for(i=0; i<inTable.Children.length; i++)
        {
            PivotTree(inTable.Children[i], inColumns, inSums, depth);
        }
    }
};
const PivotTable = (inTable, inColumnIndex, inSums) =>
{
    var i, j;
    var output;
    var table;
    var row;
    var cell;
    output = [];

    rows: for(i=0; i<inTable.Rows.length; i++)
    {
        row = inTable.Rows[i];
        console.log(row);
        cell = row[inColumnIndex];
        if(cell)
        {
            cell = cell.toString().toLowerCase();
        }
        else
        {
            cell = ":(";
        }
        uniques: for(j=0; j<output.length; j++)
        {
            if(cell == output[j].Name)
            {
                output[j].Rows.push(row);
                continue rows;
            }
        }
        table = Table(cell, inTable, [row], inSums);
        output.push(table);
    }
    return output;
};
const Table = (inName, inParent, inRows, inSums) =>
{
    var table;
    var i;
    
    table = {
        Name:inName,
        Rows:inRows,
        Parent:inParent,
        Children:[],
        Sums:[]
    };
    for(i=0; i<inSums.length; i++)
    {
        table.Sums[i] = {
            IndexSum:i,
            IndexColumn:inSums[i],
            Value:0,
            Outside:0,
            Local:1,
            Parent:1,
            Child:0,
            Total:0,
            Goal:0,
            HasEdit:false,
            HasGoal:false
        };
    }
    return table;
};

const ProcessLeaves = (inTable, inProcessor)=>
{
    var i;
    if(inTable.Children.length == 0)
    {
        for(i=0; i<inTable.Sums.length; i++)
        {
            inProcessor(inTable, inTable.Sums[i], i);
        }
    }
    else
    {
        for(i=0; i<inTable.Children.length; i++)
        {
            ProcessLeaves(inTable.Children[i], inProcessor);
        }
    }
};
const SumValue = (inTable, inSum, inSumIndex) =>
{
    var newTotal;
    var j;
    var row;
    var change;

    newTotal = 0;
    for(j=0; j<inTable.Rows.length; j++)
    {
        row = inTable.Rows[j];
        newTotal += row[inSum.IndexColumn].Original;
    }
    change = newTotal-inSum.Value;
    if(change != 0)
    {
        inSum.Value = newTotal;
        TweakUp(inTable, inSumIndex, change, TweakUpValue);
    }
};
const SumOutside = (inTable, inSum, inSumIndex) =>
{
    var newTotal;
    var j;
    var row;
    var change;

    newTotal = 0;
    for(j=0; j<inTable.Rows.length; j++)
    {
        row = inTable.Rows[j];
        newTotal += row[inSum.IndexColumn].Modified;
    }
    change = newTotal-inSum.Outside;
    if(change != 0)
    {
        inSum.Outside = newTotal;
        TweakUp(inTable, inSumIndex, change, TweakUpOutside);
    }
};

export const Tweak = (inTable, inColumnIndex, inAmount) =>
{
    var column;
    var adjust;
    var change;
    var i;
    var row;
    var cell;

    column = inTable.Sums[inColumnIndex];
    change = inAmount - column.Local;
    if(change == 0)
    {
        return;
    }

    for(i=0; i<inTable.Rows.length; i++)
    {
        row = inTable.Rows[i];
        cell = row[column.IndexColumn];
        cell.Modified = cell.Original*inAmount;
    }
    
    column.Local = inAmount;
    adjust = (column.Value*change);
    TweakUp(inTable, inColumnIndex, adjust, TweakUpChild);
    TweakDown(inTable, inColumnIndex);
};
export const TweakCheck = (inRoot)=>
{
    ProcessLeaves(inRoot, SumOutside);
}
const TweakDown = (inTable, inColumn) =>
{
    var i;
    var parentColumn;
    var parentScalar;
    parentColumn = inTable.Sums[inColumn];
    parentScalar = parentColumn.Local * parentColumn.Parent;
    for(i=0; i<inTable.Children.length; i++)
    {
        inTable.Children[i].Sums[inColumn].Parent = parentScalar;
        TweakDown(inTable.Children[i], inColumn, parentScalar);
    }
};
const TweakUp = (inTable, inColumn, inAmount, inProcessor) =>
{
    if(inTable.Parent)
    {
        inProcessor(inTable.Parent.Sums[inColumn], inAmount);
        TweakUp(inTable.Parent, inColumn, inAmount, inProcessor);
    }
};

const TweakUpValue = (inObj, inAmount) =>
{
    inObj.Value += inAmount;
};
const TweakUpOutside = (inObj, inAmount) =>
{
    inObj.Outside += inAmount;
};
const TweakUpChild = (inObj, inAmount) =>
{
    inObj.Child += inAmount;
};

export const PathDown = (inTable, inPath, inIndex) =>
{
    var i;
    var child;
    var lookup;
    var index;

    index = inIndex||0;
    lookup = inPath[index];
    for(i=0; i<inTable.Children.length; i++)
    {
        child = inTable.Children[i];
        if(child.Name === lookup)
        {
            if(index == inPath.length-1)
            {
                return child;
            }
            else
            {
                return PathDown(child, inPath, index+1);
            }
            break;
        }
    }
    return false;
};
export const PathUp = (inTable, inPath) =>
{
    inPath.unshift(inTable.Name);
    if(inTable.Parent)
    {
        return PathUp(inTable.Parent, inPath);
    }
    else
    {
        return inPath;
    }
};