export const Pivot = (inTable, inColumn) =>
{
    var i, j;
    var output;
    var row;
    var cell;
    output = [];
    rows: for(i in inTable.Rows)
    {
        row = inTable.Rows[i];
        cell = row[inColumn].toString().toLowerCase();
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
            Rows:[row],
            Parent:inTable,
        });
    }
    return output;
};

export const PivotTree = (inTable, inColumns, inDepth, inSums) =>
{
    var i;
    inTable.Children = Pivot(inTable, inColumns[inDepth]);
    inDepth++;
    if(inDepth == inColumns.length)
    {
        for(i in inTable.Children)
        {
            Sum(inTable.Children[i], inSums);
        }
        SumTree(inTable, inSums);
    }
    else
    {
        for(i in inTable.Children)
        {
            PivotTree(inTable.Children[i], inColumns, inDepth, inSums);
        }
    }

};

export const Sum = (inTable, inSums) =>
{
    var j, k;
    inTable.Sums = [];
    for(j in inSums)
    {
        inTable.Sums[j] = 0;
        for(k in inTable.Rows)
        {
            inTable.Sums[j] += inTable.Rows[k][inSums[j]];
        }
    }
};

export const SumTree = (inParent, inSums) =>
{
    var j, k;
    inParent.Sums = [];
    for(j in inSums)
    {
        inParent.Sums[j] = 0;
        for(k in inParent.Children)
        {
            inParent.Sums[j] += inParent.Children[k].Sums[j];
        }
    }
    if(inParent.Parent)
    {
        SumTree(inParent.Parent, inSums);
    }
};