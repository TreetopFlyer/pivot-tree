export const Pivot = (inTable, inColumn) =>
{
    var i, j;
    var output;
    var row;
    var cell;
    var column;
    output = [];

    rows: for(i in inTable.Rows)
    {
        row = inTable.Rows[i];
        column = MapColumn(inTable, inColumn);
        cell = row[column].toString().toLowerCase();
        uniques: for(j in output)
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
        for(i in inTable.Children)
        {
            SumRows(inTable.Children[i], inSums);
        }
    }
    else
    {
        for(i in inTable.Children)
        {
            SumRows(inTable.Children[i], inSums);
            PivotTree(inTable.Children[i], inColumns, inSums, depth);
        }
    }
};

export const SumRows = (inTable, inSums) =>
{
    var i, j;
    var column, row;
    inTable.Sums = [];
    for(i in inSums)
    {
        inTable.Sums[i] = {Value:0, Local:1, Parent:1, Child:0};
        column = MapColumn(inTable, inSums[i]);
        for(j in inTable.Rows)
        {
            row = inTable.Rows[j];
            inTable.Sums[i].Value += row[column];
        }
    }
};

export const MapColumn = (inTable, inKey) =>
{
    var i;
    for(i in inTable.Header)
    {
        if(inTable.Header[i] == inKey)
        {
            return i;
        }
    }
};

export const PathDown = (inTable, inPath, inIndex) =>
{
    var i;
    var child;
    var lookup;

    lookup = inPath[inIndex];
    for(i in inTable.Children)
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
    for(i in inTable.Children)
    {
        inTable.Children[i].Sums[inColumn].Parent = parentScalar;
        TweakDown(inTable.Children[i], inColumn, parentScalar);
    }
};

