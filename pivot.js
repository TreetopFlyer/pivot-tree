export const Pivot = (inTable, inColumnIndex) =>
{
    var i, j;
    var output;
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
        output.push({
            Name:cell,
            Header:inTable.Header,
            Rows:[row],
            Parent:inTable,
            Children:[]
        });
    }
    return output;
};

export const PivotTree = (inTable, inColumns, inSums, inDepth) =>
{
    var i;
    var depth = inDepth||0;
    inTable.Children = Pivot(inTable, inColumns[depth]);
    depth++;
    if(depth == inColumns.length)
    {
        for(i=0; i<inTable.Children.length; i++)
        {
            SumRows(inTable.Children[i], inSums);
        }
    }
    else
    {
        for(i=0; i<inTable.Children.length; i++)
        {
            SumRows(inTable.Children[i], inSums);
            PivotTree(inTable.Children[i], inColumns, inSums, depth);
        }
    }
};

export const SumRows = (inTable, inSums) =>
{
    var i, j;
    var row;
    inTable.Sums = [];
    for(i=0; i<inSums.length; i++)
    {
        inTable.Sums[i] = {
            Value:0,
            Local:1,
            Parent:1,
            Child:0,
            Total:0,
            Goal:0
        };
        for(j=0; j<inTable.Rows.length; j++)
        {
            row = inTable.Rows[j];
            inTable.Sums[i].Value += row[inSums[i]];
        }
    }
};


export const PathDown = (inTable, inPath, inIndex) =>
{
    var i;
    var child;
    var lookup;

    lookup = inPath[inIndex];
    for(i=0; i<inTable.Children.length; i++)
    {
        child = inTable.Children[i];
        if(child.Name === lookup)
        {
            if(inPath.length-1 == inIndex)
            {
                return child;
            }
            else
            {
                return PathDown(child, inPath, inIndex+1);
            }
            break;
        }
    }
    return false;
};

export const TweakUp = (inTable, inColumn, inAmount) =>
{
    if(inTable.Parent)
    {
        inTable.Parent.Sums[inColumn].Child += inAmount;
        TweakUp(inTable.Parent, inColumn, inAmount);
    }
};

export const TweakDown = (inTable, inColumn) =>
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

