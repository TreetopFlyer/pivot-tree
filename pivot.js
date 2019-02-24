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
            Children:[],
            Sums:[]
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

export const SumRows = (inTable, inSums) =>
{
    var i, j;
    var column, row;
    inTable.Sums = [];
    for(i in inSums)
    {
        inTable.Sums[i] = 0;
        column = MapColumn(inTable, inSums[i]);
        for(j in inTable.Rows)
        {
            row = inTable.Rows[j];
            inTable.Sums[i] += row[column];
        }
    }
};