
export const Pivot = (inRows, inIndiciesPivots, inIndiciesSums) =>
{
    var root;
    root = Table("Root", false, inRows, inIndiciesSums);
    PivotTree(root, inIndiciesPivots, inIndiciesSums);
    Sum(root);
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
        cell = row[inColumnIndex].toString().toLowerCase();
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
            Local:1,
            Parent:1,
            Child:0,
            Total:0,
            Goal:0
        };
    }
    return table;
};

const Sum = (inTable)=>
{
    var i, j;
    var row;
    var sum;
    var newTotal;
    var change;

    if(inTable.Children.length == 0)
    {
        console.log("at last branch", inTable);

        for(i=0; i<inTable.Sums.length; i++)
        {
            sum = inTable.Sums[i];
            newTotal = 0;
            for(j=0; j<inTable.Rows.length; j++)
            {
                row = inTable.Rows[j];
                newTotal += row[sum.IndexColumn];
            }
            change = newTotal-sum.Value;
            if(change != 0)
            {
                console.log("summing up on", i);
                sum.Value = newTotal;
                TweakUpValue(inTable, i, change);
            }
        }
    }
    else
    {
        for(i=0; i<inTable.Children.length; i++)
        {
            Sum(inTable.Children[i]);
        }
    }
};


export const Tweak = (inTable, inColumnIndex, inAmount) =>
{
    var column;
    var adjust;
    var change;
    column = inTable.Sums[inColumnIndex];
    change = inAmount - column.Local;
    if(change == 0)
    {
        return;
    }
    column.Local = inAmount;
    adjust = (column.Value*column.Local) - (column.Value);
    TweakUpChild(inTable, inColumnIndex, adjust);
    TweakDownParent(inTable, inColumnIndex);
};
const TweakUpChild = (inTable, inColumn, inAmount) =>
{
    if(inTable.Parent)
    {
        inTable.Parent.Sums[inColumn].Child += inAmount;
        TweakUpChild(inTable.Parent, inColumn, inAmount);
    }
};
const TweakUpValue = (inTable, inColumn, inAmount) =>
{
    var obj;
    if(inTable.Parent)
    {
        obj = inTable.Parent.Sums[inColumn]
        console.log("moving up", inAmount, " old:", obj.Value, "new", obj.Value+inAmount);
        obj.Value += inAmount;
        TweakUpValue(inTable.Parent, inColumn, inAmount);
    }
};
const TweakDownParent = (inTable, inColumn) =>
{
    var i;
    var parentColumn;
    var parentScalar;
    parentColumn = inTable.Sums[inColumn];
    parentScalar = parentColumn.Local * parentColumn.Parent;
    for(i=0; i<inTable.Children.length; i++)
    {
        inTable.Children[i].Sums[inColumn].Parent = parentScalar;
        TweakDownParent(inTable.Children[i], inColumn, parentScalar);
    }
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